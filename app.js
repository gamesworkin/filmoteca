const CREDENTIALS = { user: "admin", pass: "admin123" };
let allVideos = [];
let currentPlaylist = [];
let currentIndex = -1;
let activeFilterVideos = []; 

// Função de segurança para extrair o título independente de acentos no JSON
function getSafeTitle(video) {
    return video.título || video.titulo || "Sem Título";
}

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggle-menu").addEventListener("click", () => sidebar.classList.toggle("collapsed"));

    document.getElementById("search-input").addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = activeFilterVideos.filter(v => {
            const title = getSafeTitle(v).toLowerCase();
            const cat = (v.categoria || "").toLowerCase();
            const sub = (v.subcategoria || "").toLowerCase();
            return title.includes(term) || cat.includes(term) || sub.includes(term);
        });
        renderGrid(filtered, document.getElementById("current-view-title").innerText, false);
    });

    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if(document.getElementById("username").value === CREDENTIALS.user && 
           document.getElementById("password").value === CREDENTIALS.pass) {
            localStorage.setItem("session", "true");
            initApp();
        } else {
            document.getElementById("login-error").style.display = "block";
        }
    });

    if(localStorage.getItem("session") === "true") initApp();
    
    document.getElementById("btn-logout").addEventListener("click", () => {
        localStorage.clear();
        location.reload();
    });
});

async function initApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    
    try {
        const pathName = window.location.pathname;
        const basePath = pathName.substring(0, pathName.lastIndexOf('/')) + '/';
        const jsonUrl = window.location.origin + basePath + 'videos.json';

        // Cache busting: adiciona um número aleatório para garantir que o navegador baixe o JSON novo
        const res = await fetch(jsonUrl + "?t=" + new Date().getTime());
        allVideos = await res.json();
        activeFilterVideos = allVideos;
        
        buildSidebar(allVideos);
        renderGrid(allVideos, 'Início');
        setupModal();
    } catch (error) {
        console.error("Erro ao carregar banco de dados JSON", error);
    }
}

function buildSidebar(videos) {
    const menu = document.getElementById("sidebar-menu");
    const cats = [...new Set(videos.map(v => v.categoria).filter(Boolean))];
    menu.innerHTML = `<div class="category-title-link" onclick="resetToHome()"><i class="fa-solid fa-house"></i> <span>Início</span></div>`;
    
    cats.forEach(cat => {
        const subCats = [...new Set(videos.filter(v => v.categoria === cat).map(v => v.subcategoria).filter(Boolean))];
        let html = `<div class="category-title-link" onclick="filterCat('${cat}')"><i class="fa-solid fa-folder"></i> <span>${cat}</span></div>`;
        html += `<ul class="subcategory-list">`;
        subCats.forEach(sub => {
            html += `<li onclick="filterSub('${cat}', '${sub}')">${sub}</li>`;
        });
        html += `</ul>`;
        menu.innerHTML += html;
    });
}

function resetToHome() {
    document.getElementById("search-input").value = "";
    activeFilterVideos = allVideos;
    renderGrid(allVideos, 'Início');
}

function renderGrid(videos, title = "Vídeos", updateActive = true) {
    document.getElementById("current-view-title").innerText = title;
    const grid = document.getElementById("categories-grid");
    grid.innerHTML = "";

    if (updateActive) activeFilterVideos = videos;

    const groups = {};
    videos.forEach(v => {
        const k = `${v.categoria}${v.subcategoria ? ' > ' + v.subcategoria : ''}`;
        if(!groups[k]) groups[k] = [];
        groups[k].push(v);
    });

    for(let key in groups) {
        const vids = groups[key];
        const row = document.createElement("div");
        row.className = "playlist-row";
        
        row.innerHTML = `
            <div class="playlist-header" data-expanded="false">
                <img src="${vids[0].capa}" class="playlist-cover-preview">
                <div class="playlist-info">
                    <h2>${key}</h2>
                    <p><span>${vids.length} vídeos</span> — <span class="status-icon">Clique para abrir <i class="fa-solid fa-chevron-down"></i></span></p>
                </div>
            </div>
            <div class="playlist-videos-expand hidden"></div>
        `;
        
        const header = row.querySelector(".playlist-header");
        const container = row.querySelector(".playlist-videos-expand");
        
        header.addEventListener("click", () => {
            const isExpanded = header.getAttribute("data-expanded") === "true";
            if(isExpanded) {
                container.classList.add("hidden");
                container.innerHTML = "";
                header.setAttribute("data-expanded", "false");
                header.querySelector(".status-icon").innerHTML = 'Clique para abrir <i class="fa-solid fa-chevron-down"></i>';
            } else {
                container.innerHTML = "";
                vids.forEach(vid => {
                    const card = document.createElement("div");
                    card.className = "video-card";
                    // CORREÇÃO: Chama getSafeTitle para evitar o undefined
                    card.innerHTML = `
                        <img src="${vid.capa}" class="video-thumb">
                        <div class="video-info">${getSafeTitle(vid)}</div>
                    `;
                    card.onclick = (e) => {
                        e.stopPropagation();
                        openPlayer(vid, vids);
                    };
                    container.appendChild(card);
                });
                container.classList.remove("hidden");
                header.setAttribute("data-expanded", "true");
                header.querySelector(".status-icon").innerHTML = 'Clique para fechar <i class="fa-solid fa-chevron-up"></i>';
            }
        });
        grid.appendChild(row);
    }
}

function filterCat(c) { 
    document.getElementById("search-input").value = "";
    renderGrid(allVideos.filter(v => v.categoria === c), c); 
}
function filterSub(c, s) { 
    document.getElementById("search-input").value = "";
    renderGrid(allVideos.filter(v => v.categoria === c && v.subcategoria === s), s); 
}

function openPlayer(video, playlist) {
    currentPlaylist = playlist;
    currentIndex = playlist.findIndex(v => v.link === video.link);
    const modal = document.getElementById("video-modal");
    const wrapper = document.getElementById("player-wrapper");
    modal.classList.remove("hidden");
    // CORREÇÃO: Chama getSafeTitle aqui também
    document.getElementById("modal-video-title").innerText = getSafeTitle(video);

    const url = video.link.trim();
    const isDirectFile = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url);

    if (isDirectFile) {
        wrapper.innerHTML = `<video id="main-player" controls autoplay><source src="${url}" type="video/mp4"></video>`;
        wrapper.querySelector('video').onended = () => changeVideo(1);
    } else {
        let finalUrl = url;
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            finalUrl += (url.includes("?") ? "&" : "?") + "autoplay=1";
        }
        wrapper.innerHTML = `<iframe id="main-player" src="${finalUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    }
}

function changeVideo(step) {
    currentIndex += step;
    if(currentIndex >= 0 && currentIndex < currentPlaylist.length) {
        openPlayer(currentPlaylist[currentIndex], currentPlaylist);
    } else if (currentIndex >= currentPlaylist.length) {
        alert("Fim da playlist!");
        closeModal();
    }
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
