const CREDENTIALS = { user: "admin", pass: "admin123" };
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos

let allVideos = [];
let currentPlaylist = [];
let currentIndex = -1;

function getSafeTitle(v) { return v.título || v.titulo || "Sem Título"; }

document.addEventListener("DOMContentLoaded", () => {
    checkSessionTimeout();

    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggle-menu").addEventListener("click", () => sidebar.classList.toggle("collapsed"));

    document.getElementById("search-input").addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allVideos.filter(v => 
            getSafeTitle(v).toLowerCase().includes(term) || 
            (v.categoria || "").toLowerCase().includes(term) || 
            (v.subcategoria || "").toLowerCase().includes(term)
        );
        renderGrid(filtered, "Resultado: " + term);
    });

    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if(document.getElementById("username").value === CREDENTIALS.user && 
           document.getElementById("password").value === CREDENTIALS.pass) {
            
            const now = new Date().getTime();
            localStorage.setItem("session_active", "true");
            localStorage.setItem("session_start", now);
            
            initApp();
        } else {
            document.getElementById("login-error").style.display = "block";
        }
    });

    if(localStorage.getItem("session_active") === "true") initApp();
});

// Lógica de Expiração de Login
function checkSessionTimeout() {
    const sessionStart = localStorage.getItem("session_start");
    if (sessionStart) {
        const now = new Date().getTime();
        if (now - sessionStart > SESSION_TIMEOUT) {
            logout();
        }
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

document.getElementById("btn-logout").addEventListener("click", logout);

async function initApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    
    try {
        const pathName = window.location.pathname;
        const basePath = pathName.substring(0, pathName.lastIndexOf('/')) + '/';
        const jsonUrl = window.location.origin + basePath + 'videos.json';

        const res = await fetch(jsonUrl + "?t=" + new Date().getTime());
        allVideos = await res.json();
        
        buildSidebar(allVideos);
        renderGrid(allVideos, 'Início');
        setupModal();
    } catch (error) {
        console.error("Erro JSON:", error);
    }
}

// Menu Lateral: Apenas navega se clicar.
function buildSidebar(videos) {
    const menu = document.getElementById("sidebar-menu");
    const cats = [...new Set(videos.map(v => v.categoria).filter(Boolean))];
    
    menu.innerHTML = `<div class="category-item" onclick="resetToHome()"><span><i class="fa-solid fa-house"></i> Início</span></div>`;
    
    cats.forEach(cat => {
        const group = document.createElement("div");
        group.className = "menu-category-group";
        
        const catBtn = document.createElement("div");
        catBtn.className = "category-item";
        catBtn.innerHTML = `<span><i class="fa-solid fa-folder"></i> ${cat}</span> <i class="fa-solid fa-chevron-down chevron"></i>`;
        
        const subList = document.createElement("ul");
        subList.className = "subcategory-list hidden";
        
        const subCats = [...new Set(videos.filter(v => v.categoria === cat).map(v => v.subcategoria).filter(Boolean))];
        subCats.forEach(sub => {
            const li = document.createElement("li");
            li.innerText = sub;
            li.onclick = (e) => {
                e.stopPropagation();
                // Apenas renderiza no corpo se CLICAR na subcategoria
                filterSub(cat, sub);
            };
            subList.appendChild(li);
        });

        catBtn.onclick = () => {
            subList.classList.toggle("hidden");
            catBtn.classList.toggle("expanded");
            // Apenas renderiza no corpo se CLICAR na categoria
            filterCat(cat);
        };

        group.appendChild(catBtn);
        group.appendChild(subList);
        menu.appendChild(group);
    });
}

function resetToHome() {
    document.getElementById("search-input").value = "";
    renderGrid(allVideos, 'Início');
}

// Renderização Principal do Site
function renderGrid(videos, title) {
    document.getElementById("current-view-title").innerText = title;
    const grid = document.getElementById("categories-grid");
    grid.innerHTML = "";

    const catGroups = {};
    videos.forEach(v => {
        if(!catGroups[v.categoria]) catGroups[v.categoria] = [];
        catGroups[v.categoria].push(v);
    });

    for(let catName in catGroups) {
        const catVideos = catGroups[catName];
        const row = document.createElement("div");
        row.className = "category-row";
        row.innerHTML = `
            <div class="row-header" data-expanded="false">
                <img src="${catVideos[0].capa}" class="row-cover-preview">
                <div class="row-info">
                    <h2>${catName}</h2>
                    <p>${catVideos.length} vídeos — <span class="status-icon"><i class="fa-solid fa-chevron-down"></i></span></p>
                </div>
            </div>
            <div class="sub-container hidden"></div>
        `;

        const header = row.querySelector(".row-header");
        const subDiv = row.querySelector(".sub-container");

        header.onclick = () => {
            const exp = header.getAttribute("data-expanded") === "true";
            if(exp) {
                subDiv.classList.add("hidden");
                subDiv.innerHTML = "";
                header.setAttribute("data-expanded", "false");
            } else {
                renderSubRows(catVideos, subDiv);
                subDiv.classList.remove("hidden");
                header.setAttribute("data-expanded", "true");
            }
        };
        grid.appendChild(row);
    }
}

function renderSubRows(videos, container) {
    const subs = {};
    videos.forEach(v => {
        const s = v.subcategoria || "Geral";
        if(!subs[s]) subs[s] = [];
        subs[s].push(v);
    });

    for(let sName in subs) {
        const sVids = subs[sName];
        const sRow = document.createElement("div");
        sRow.className = "subcategory-row";
        sRow.innerHTML = `
            <div class="row-header" data-expanded="false">
                <div class="row-info">
                    <h2><i class="fa-solid fa-caret-right"></i> ${sName}</h2>
                    <p>${sVids.length} vídeos</p>
                </div>
            </div>
            <div class="v-grid hidden"></div>
        `;
        const sHeader = sRow.querySelector(".row-header");
        const vGrid = sRow.querySelector(".v-grid");

        sHeader.onclick = (e) => {
            e.stopPropagation();
            const exp = sHeader.getAttribute("data-expanded") === "true";
            if(exp) {
                vGrid.classList.add("hidden");
                vGrid.innerHTML = "";
                sHeader.setAttribute("data-expanded", "false");
            } else {
                sVids.forEach(vid => {
                    const card = document.createElement("div");
                    card.className = "video-card";
                    card.innerHTML = `<img src="${vid.capa}" class="video-thumb"><div class="video-info" title="${getSafeTitle(vid)}">${getSafeTitle(vid)}</div>`;
                    card.onclick = (ev) => { ev.stopPropagation(); openPlayer(vid, sVids); };
                    vGrid.appendChild(card);
                });
                vGrid.classList.remove("hidden");
                sHeader.setAttribute("data-expanded", "true");
            }
        };
        container.appendChild(sRow);
    }
}

function filterCat(c) { renderGrid(allVideos.filter(v => v.categoria === c), c); }
function filterSub(c, s) { renderGrid(allVideos.filter(v => v.categoria === c && v.subcategoria === s), s); }

// PLAYER
function openPlayer(video, playlist) {
    currentPlaylist = playlist;
    currentIndex = playlist.findIndex(v => v.link === video.link);
    const modal = document.getElementById("video-modal");
    const wrapper = document.getElementById("player-wrapper");
    modal.classList.remove("hidden");
    document.getElementById("modal-video-title").innerText = getSafeTitle(video);

    const url = video.link.trim();
    if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(url)) {
        wrapper.innerHTML = `<video id="main-player" controls autoplay><source src="${url}" type="video/mp4"></video>`;
        wrapper.querySelector('video').onended = () => changeVideo(1);
    } else {
        let fUrl = url;
        if (url.includes("youtube.com") || url.includes("youtu.be")) fUrl += (url.includes("?") ? "&" : "?") + "autoplay=1";
        wrapper.innerHTML = `<iframe id="main-player" src="${fUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }
}

function changeVideo(s) {
    currentIndex += s;
    if(currentIndex >= 0 && currentIndex < currentPlaylist.length) openPlayer(currentPlaylist[currentIndex], currentPlaylist);
    else closeModal();
}

function closeModal() {
    document.getElementById("video-modal").classList.add("hidden");
    document.getElementById("player-wrapper").innerHTML = "";
}

function setupModal() {
    document.getElementById("close-modal").onclick = closeModal;
    document.getElementById("next-video-btn").onclick = () => changeVideo(1);
    document.getElementById("prev-video-btn").onclick = () => changeVideo(-1);
    document.querySelector(".modal-backdrop").onclick = closeModal;
}
