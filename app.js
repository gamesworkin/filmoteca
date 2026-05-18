const CREDENTIALS = { user: "admin", pass: "admin123" };
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

let allVideos = [];
let currentPlaylist = [];
let currentIndex = -1;

function getSafeTitle(v) { return v.título || v.titulo || "Sem Título"; }

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggle-menu").addEventListener("click", () => sidebar.classList.toggle("collapsed"));

    document.getElementById("search-input").addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allVideos.filter(v => 
            getSafeTitle(v).toLowerCase().includes(term) || 
            (v.categoria || "").toLowerCase().includes(term) || 
            (v.subcategoria || "").toLowerCase().includes(term)
        );
        renderGrid(filtered, "Busca: " + term);
    });

    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if(document.getElementById("username").value === CREDENTIALS.user && 
           document.getElementById("password").value === CREDENTIALS.pass) {
            localStorage.setItem("session_active", "true");
            localStorage.setItem("session_start", new Date().getTime());
            initApp();
        } else {
            document.getElementById("login-error").style.display = "block";
        }
    });

    if(localStorage.getItem("session_active") === "true") initApp();
});

function checkSession() {
    const start = localStorage.getItem("session_start");
    if(start && (new Date().getTime() - start > SESSION_TIMEOUT)) logout();
}

function logout() { localStorage.clear(); location.reload(); }
document.getElementById("btn-logout").addEventListener("click", logout);

async function initApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    
    try {
        const path = window.location.pathname;
        const basePath = path.substring(0, path.lastIndexOf('/')) + '/';
        const url = window.location.origin + basePath + 'videos.json';
        const res = await fetch(url + "?t=" + new Date().getTime());
        allVideos = await res.json();
        
        buildSidebar(allVideos);
        renderGrid(allVideos, 'Início');
        setupModal();
    } catch (e) { console.error("Erro JSON:", e); }
}

function buildSidebar(videos) {
    const menu = document.getElementById("sidebar-menu");
    const cats = [...new Set(videos.map(v => v.categoria).filter(Boolean))];
    menu.innerHTML = `<div class="category-item" onclick="resetHome()"><span><i class="fa-solid fa-house"></i> Início</span></div>`;
    
    cats.forEach(cat => {
        const group = document.createElement("div");
        group.className = "menu-category-group";
        const btn = document.createElement("div");
        btn.className = "category-item";
        btn.innerHTML = `<span><i class="fa-solid fa-folder"></i> ${cat}</span> <i class="fa-solid fa-chevron-down chevron"></i>`;
        
        const subList = document.createElement("ul");
        subList.className = "subcategory-list hidden";
        const subCats = [...new Set(videos.filter(v => v.categoria === cat).map(v => v.subcategoria).filter(Boolean))];
        
        subCats.forEach(sub => {
            const li = document.createElement("li");
            li.innerText = sub;
            li.onclick = (e) => { e.stopPropagation(); filterSub(cat, sub); };
            subList.appendChild(li);
        });

        btn.onclick = () => {
            subList.classList.toggle("hidden");
            btn.classList.toggle("expanded");
            filterCat(cat);
        };
        group.appendChild(btn);
        group.appendChild(subList);
        menu.appendChild(group);
    });
}

function resetHome() {
    document.getElementById("search-input").value = "";
    renderGrid(allVideos, 'Início');
}

// NÍVEL 1: RENDERIZA CATEGORIAS
function renderGrid(videos, title) {
    document.getElementById("current-view-title").innerText = title;
    const grid = document.getElementById("categories-grid");
    grid.innerHTML = "";

    const groups = {};
    videos.forEach(v => {
        if(!groups[v.categoria]) groups[v.categoria] = [];
        groups[v.categoria].push(v);
    });

    for(let name in groups) {
        const vids = groups[name];
        const card = document.createElement("div");
        card.className = "mosaic-card";
        card.innerHTML = `
            <img src="${vids[0].capa}" class="card-thumb">
            <div class="card-info">
                <h2>${name}</h2>
                <p>${vids.length} vídeos</p>
            </div>
        `;

        const subContainer = document.createElement("div");
        subContainer.className = "expanded-container hidden";

        card.onclick = () => {
            const isHidden = subContainer.classList.contains("hidden");
            document.querySelectorAll(".expanded-container").forEach(el => el.classList.add("hidden"));
            
            if(isHidden) {
                renderSubcategoriesInBody(vids, subContainer);
                subContainer.classList.remove("hidden");
            }
        };

        grid.appendChild(card);
        grid.appendChild(subContainer);
    }
}

// NÍVEL 2: RENDERIZA SUBCATEGORIAS (AINDA RECOLHIDAS)
function renderSubcategoriesInBody(videos, container) {
    container.innerHTML = `<div class="exp-title">Subcategorias</div>`;
    const subGrid = document.createElement("div");
    subGrid.className = "sub-mosaic-grid";

    const subs = {};
    videos.forEach(v => {
        const s = v.subcategoria || "Geral";
        if(!subs[s]) subs[s] = [];
        subs[s].push(v);
    });

    for(let sName in subs) {
        const sVids = subs[sName];
        const sCard = document.createElement("div");
        sCard.className = "mosaic-card";
        sCard.innerHTML = `
            <img src="${sVids[0].capa}" class="card-thumb">
            <div class="card-info">
                <h2>${sName}</h2>
                <p>${sVids.length} itens</p>
            </div>
        `;

        const videoContainer = document.createElement("div");
        videoContainer.className = "expanded-container hidden";
        videoContainer.style.background = "#050505";

        sCard.onclick = (e) => {
            e.stopPropagation();
            const isHidden = videoContainer.classList.contains("hidden");
            // Fecha outros vídeos expandidos na mesma categoria para não poluir
            container.querySelectorAll(".expanded-container").forEach(el => el.classList.add("hidden"));

            if(isHidden) {
                renderVideosInBody(sVids, videoContainer);
                videoContainer.classList.remove("hidden");
            }
        };

        subGrid.appendChild(sCard);
        subGrid.appendChild(videoContainer);
    }
    container.appendChild(subGrid);
}

// NÍVEL 3: RENDERIZA VÍDEOS (GRADE FINAL)
function renderVideosInBody(videos, container) {
    container.innerHTML = `<div class="exp-title">Vídeos disponíveis</div>`;
    const vGrid = document.createElement("div");
    vGrid.className = "videos-mosaic";

    videos.forEach(vid => {
        const vCard = document.createElement("div");
        vCard.className = "mosaic-card";
        vCard.innerHTML = `
            <img src="${vid.capa}" class="card-thumb">
            <div class="card-info">
                <h2>${getSafeTitle(vid)}</h2>
            </div>
        `;
        vCard.onclick = (e) => { e.stopPropagation(); openPlayer(vid, videos); };
        vGrid.appendChild(vCard);
    });
    container.appendChild(vGrid);
}

function filterCat(c) { renderGrid(allVideos.filter(v => v.categoria === c), c); }
function filterSub(c, s) { 
    const filtered = allVideos.filter(v => v.categoria === c && v.subcategoria === s);
    renderGrid(filtered, s);
}

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
