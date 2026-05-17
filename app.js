// CONFIGURAÇÃO DE ACESSO
const AUTH = {
    user: "admin",
    pass: "1234",
    tempoLimite: 40 * 60 * 1000 // 40 minutos em milissegundos
};

// Verifica o login e o tempo de sessão ao carregar a página
window.onload = function() {
    const loginTime = localStorage.getItem("loginTime");
    const agora = new Date().getTime();

    if (localStorage.getItem("logado") === "true" && loginTime) {
        // Verifica se o tempo atual menos o tempo do login é maior que o limite
        if (agora - loginTime > AUTH.tempoLimite) {
            alert("Sua sessão expirou após 40 minutos. Por favor, faça login novamente.");
            logout();
        } else {
            exibirConteudo();
        }
    }
};

function checkLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const error = document.getElementById('login-error');

    if(u === AUTH.user && p === AUTH.pass) {
        const agora = new Date().getTime();
        
        // Salva que está logado e o momento exato do login
        localStorage.setItem("logado", "true");
        localStorage.setItem("loginTime", agora);
        
        exibirConteudo();
    } else {
        error.innerText = "Usuário ou senha incorretos.";
    }
}

function exibirConteudo() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    loadVideos();
}

function logout() {
    localStorage.removeItem("logado");
    localStorage.removeItem("loginTime");
    location.reload();
}





let allVideos = [];

async function loadVideos() {
    try {
        // Adicionamos um carimbo de data/hora para evitar que o navegador use uma versão antiga (cache)
        const response = await fetch('videos.json?nocache=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        allVideos = await response.json();
        console.log("Vídeos carregados com sucesso:", allVideos); // Verifique isso no F12
        renderVideos(allVideos);
    } catch (e) {
        console.error("Erro detalhado:", e);
        alert("Não foi possível carregar o arquivo vídeos.json. Verifique se o nome do arquivo está correto.");
    }
}


function renderVideos(videos) {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    const categories = [...new Set(videos.map(v => v.categoria))];

    categories.forEach(cat => {
        const section = document.createElement('section');
        section.className = 'category-section';
        
        const filtered = videos.filter(v => v.categoria === cat);
        
        section.innerHTML = `
            <h2>${cat}</h2>
            <div class="video-grid">
                ${filtered.map(v => `
                    <div class="video-card" onclick="openPlayer('${v.link}', '${v.titulo}')">
                        <img src="${v.capa}" alt="${v.titulo}">
                        <h3>${v.titulo}</h3>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    });
}

// Busca
document.getElementById('search-btn').addEventListener('click', () => {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = allVideos.filter(v => v.titulo.toLowerCase().includes(term));
    renderVideos(filtered);
});

// Player Logic
function openPlayer(link, titulo) {
    const modal = document.getElementById('player-modal');
    const wrapper = document.getElementById('video-wrapper');
    document.getElementById('modal-title').innerText = titulo;

    let embedUrl = link;
    if(link.includes('youtube.com/watch?v=')) {
        embedUrl = link.replace('watch?v=', 'embed/');
    }

    // Criamos o HTML com a camada protetora (shield)
    // O sandbox abaixo é restritivo e impede o redirecionamento (top-navigation)
    wrapper.innerHTML = `
        <div class="video-container-wrapper">
            <div class="player-shield"></div>
            <iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms">
            </iframe>
        </div>
    `;
    modal.classList.remove('hidden');
}
lassList.remove('hidden');
}

function closePlayer() {
    document.getElementById('player-modal').classList.add('hidden');
    document.getElementById('video-wrapper').innerHTML = '';
}
// Detectar tecla Enter no campo de Login
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkLogin();
    }
});

// Detectar tecla Enter no campo de Pesquisa
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const term = this.value.toLowerCase();
        const filtered = allVideos.filter(v => 
            v.titulo.toLowerCase().includes(term) || 
            v.categoria.toLowerCase().includes(term)
        );
        renderVideos(filtered);
    }
});
