:root {
    --bg-main: #0f0f0f;
    --bg-sidebar: #000000;
    --bg-card: #1a1a1a;
    --accent: #e50914;
    --text: #ffffff;
    --border: #2b2b2b;
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
body { background-color: var(--bg-main); color: var(--text); overflow: hidden; }
.hidden { display: none !important; }

.login-container { height: 100vh; display: flex; justify-content: center; align-items: center; background: #000; }
.login-box { background: #141414; padding: 40px; border-radius: 12px; width: 350px; text-align: center; border: 1px solid var(--border); }
.login-box h2 { color: var(--accent); margin-bottom: 20px; }
.input-group { text-align: left; margin-bottom: 15px; }
.input-group label { font-size: 12px; color: #888; display: block; margin-bottom: 5px; }
.input-group input { width: 100%; padding: 10px; background: #333; border: none; color: #fff; border-radius: 4px; }
.btn-login { width: 100%; padding: 12px; background: var(--accent); border: none; color: #fff; font-weight: bold; cursor: pointer; border-radius: 4px; }
.error-message { color: var(--accent); margin-top: 10px; display: none; }

.main-wrapper { display: flex; height: 100vh; }
.sidebar { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border); transition: width 0.3s ease; display: flex; flex-direction: column; position: relative; }
.sidebar.collapsed { width: 60px; }
.sidebar.collapsed .sidebar-header, .sidebar.collapsed .category-title-link span, .sidebar.collapsed .subcategory-list, .sidebar.collapsed .btn-logout span { display: none; }

.sidebar-toggle { padding: 20px; cursor: pointer; text-align: center; color: var(--accent); font-size: 20px; }
.sidebar-content { flex: 1; padding: 0 10px; overflow-y: auto; overflow-x: hidden; }
.category-title-link { padding: 12px; cursor: pointer; display: block; white-space: nowrap; }
.category-title-link:hover { background: #1a1a1a; border-radius: 8px; }
.subcategory-list { padding-left: 30px; list-style: none; margin-bottom: 10px; }
.subcategory-list li { padding: 8px 0; color: #888; cursor: pointer; font-size: 14px; }
.subcategory-list li:hover { color: #fff; }

.content-area { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; }
.top-search-bar { width: 100%; margin-bottom: 25px; }
.search-box { display: flex; align-items: center; background: #141414; border: 1px solid var(--border); padding: 12px 20px; border-radius: 30px; max-width: 600px; }
.search-box i { color: #666; margin-right: 15px; }
.search-box input { background: transparent; border: none; color: #fff; font-size: 15px; width: 100%; outline: none; }

.main-header { margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
.playlist-row { background: #141414; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid var(--border); }
.playlist-header { display: flex; align-items: center; gap: 20px; cursor: pointer; }
.playlist-cover-preview { width: 160px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #333; }
.playlist-info h2 { font-size: 1.3rem; margin-bottom: 4px; }
.playlist-info p { color: #666; font-size: 0.9rem; }
.status-icon { color: var(--accent); margin-left: 5px; }

.playlist-videos-expand { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
.video-card { background: var(--bg-card); border-radius: 8px; overflow: hidden; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
.video-card:hover { transform: scale(1.03); border-color: var(--accent); }
.video-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.video-info { padding: 12px; font-size: 14px; color: #ffffff !important; font-weight: bold; }

.video-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.9); }
.modal-content { position: relative; width: 90%; height: 85%; background: #000; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
.player-container { flex: 1; background: #000; }
.player-container iframe, .player-container video { width: 100%; height: 100%; border: none; }
.player-controls-bar { padding: 20px; background: #111; display: flex; justify-content: space-between; align-items: center; }
.control-btn { background: #333; border: none; color: #fff; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.close-btn { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.5); border: none; color: #fff; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; }
