const CREDENTIALS = { user: "admin", pass: "admin123" };
let allVideos = [];
let activeFilterVideos = []; 
let currentPlaylist = [];
let currentIndex = -1;

// Auxiliar para evitar undefined em títulos
function getSafeTitle(video) {
    return video.título || video.titulo || "Sem Título";
}

document.addEventListener("DOMContentLoaded", () => {
    // Menu Retrátil
    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggle-menu").addEventListener("click", () => sidebar.classList.toggle("collapsed"));

    // Pesquisa Universal
    document.getElementById("search-input").addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allVideos.filter(v => 
            getSafeTitle(v).toLowerCase().includes(term) || 
            (v.categoria || "").toLowerCase().includes(term) || 
            (v.subcategoria || "").toLowerCase().includes(term)
        );
        renderGrid(filtered, "Resultados da Pesquisa");
    });

    // Login
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

        const res = await fetch(jsonUrl + "?t=" + new Date().getTime());
        allVideos = await res.json();
        
        buildSidebar(allVideos);
        renderGrid(allVideos, 'Início');
        setupModal();
    } catch (error) {
        console.error("Erro ao carregar banco de dados JSON", error);
    }
}

// Sidebar permanece igual às versões anteriores
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
    renderGrid(allVideos, 'Início');
}

// NOVO: Renderização em Cascata (Categoria -> Subcategoria -> Vídeo)
function renderGrid(videos, title = "Vídeos") {
    document.getElementById("current-view-title").innerText = title;
    const grid = document.getElementById("categories-grid");
    grid.innerHTML = "";

    // Agrupa apenas por CATEGORIA primeiro
    const catGroups = {};
    videos.forEach(v => {
        if(!catGroups[v.categoria]) catGroups[v.categoria] = [];
        catGroups[v.categoria].push(v);
    });

    for(let catName in catGroups) {
        const catVideos = catGroups[catName];
        
        const catRow = document.createElement("div");
        catRow.className = "category-row";
        catRow.innerHTML = `
            <div class="row-header" data-expanded="false">
                <img src="${catVideos[0].capa}" class="row-cover-preview">
                <div class="row-info">
                    <h2>${catName}</h2>
                    <p>${catVideos.length} vídeos no total — <span class="status-icon">Explorar categoria <i class="fa-solid fa-chevron-down"></i></span></p>
                </div>
            </div>
            <div class="subcategories-container hidden"></div>
        `;

        const header = catRow.querySelector(".row-header");
        const subContainer = catRow.querySelector(".subcategories-container");

        header.addEventListener("click", () => {
            const isExpanded = header.getAttribute("data-expanded") === "true";
            if(isExpanded) {
                subContainer.classList.add("hidden");
                subContainer.innerHTML = "";
                header.setAttribute("data-expanded", "false");
            } else {
                renderSubcategories(catVideos, subContainer);
                subContainer.classList.remove("hidden");
                header.setAttribute("data-expanded", "true");
            }
        });

        grid.appendChild(catRow);
    }
}

// Renderiza o segundo nível (Subcategorias dentro de uma Categoria)
function renderSubcategories(videos, container) {
    container.innerHTML = "";
    const subGroups = {};
    videos.forEach(v => {
        const subName = v.subcategoria || "Geral";
        if(!subGroups[subName]) subGroups[subName] = [];
        subGroups[subName].push(v);
    });

    for(let subName in subGroups) {
        const subVideos = subGroups[subName];
        const subRow = document.createElement("div");
        subRow.className = "subcategory-row";
        subRow.innerHTML = `
            <div class="row-header" data-expanded="false">
                <div class="row-info">
                    <h2><i class="fa-solid fa-caret-right"></i> ${subName}</h2>
                    <p>${subVideos.length} vídeos nesta seção</p>
                </div>
            </div>
            <div class="videos-grid hidden"></div>
        `;

        const subHeader = subRow.querySelector(".row-header");
        const videoGrid = subRow.querySelector(".videos-grid");

        subHeader.addEventListener("click", (e) => {
            e.stopPropagation();
            const isExpanded = subHeader.getAttribute("data-expanded") === "true";
            if(isExpanded) {
                videoGrid.classList.add("hidden");
                videoGrid.innerHTML = "";
                subHeader.setAttribute("data-expanded", "false");
            } else {
                renderVideosInGrid(subVideos, videoGrid);
                videoGrid.classList.remove("hidden");
                subHeader.setAttribute("data-expanded", "true");
            }
        });

        container.appendChild(subRow);
    }
}

// Renderiza o terceiro nível (A grade de vídeos final)
function renderVideosInGrid(videos, grid) {
    grid.innerHTML = "";
    videos.forEach(vid => {
        const card = document.createElement("div");
        card.className = "video-card";
        card.innerHTML = `
            <img src="${vid.capa}" class="video-thumb">
            <div class="video-info">${getSafeTitle(vid)}</div>
        `;
        card.onclick = (e) => {
            e.stopPropagation();
            openPlayer(vid, videos);
        };
        grid.appendChild(card);
    });
}

function filterCat(c) { 
    renderGrid(allVideos.filter(v => v.categoria === c), c); 
}
function filterSub(c, s) { 
    const filtered = allVideos.filter(v => v.categoria === c && v.subcategoria === s);
    // Para filtro lateral, mostramos direto a subcategoria selecionada
    renderGrid(filtered, s);
}

// PLAYER UNIVERSAL
function openPlayer(video, playlist) {
    currentPlaylist = playlist;
    currentIndex = playlist.findIndex(v => v.link === video.link);
    const modal = document.getElementById("video-modal");
    const wrapper = document.getElementById("player-wrapper");
    modal.classList.remove("hidden");
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
