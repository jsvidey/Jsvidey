(() => {
  const mount = document.getElementById("navbarMount");
  if (!mount) return;
  const languageKey = "jsvidey-language";
  const isLoggedIn = () => { try { return Boolean(localStorage.getItem("jsvidey-session")); } catch (_) { return false; } };
  const loggedIn = isLoggedIn();
  document.body.classList.toggle("jsvidey-logged-in", loggedIn);
  const page = document.body.dataset.page || "";
  const langNow = () => { try { return localStorage.getItem(languageKey) || "id"; } catch (_) { return "id"; } };
  const t = (id, en) => langNow() === "en" ? en : id;
  mount.innerHTML = `<header class="site-navbar"><div class="nav-inner">
    <a class="brand" href="index.html" aria-label="Jsvidey home"><span class="brand-mark"><i class="fa-solid fa-play"></i></span><span>Jsvidey</span></a>
    <div class="nav-actions">
      <div class="language-switch" role="group" aria-label="Language">
        <button type="button" data-lang="id" aria-pressed="${langNow()==='id'}">ID</button>
        <span aria-hidden="true">/</span>
        <button type="button" data-lang="en" aria-pressed="${langNow()==='en'}">EN</button>
      </div>
      ${loggedIn ? `<a class="btn primary nav-dashboard" href="dashboard.html"><i class="fa-solid fa-gauge-high"></i><span data-nav-dashboard>${t('Dashboard','Dashboard')}</span></a>` : `<div class="nav-auth-only"><a class="btn secondary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i><span data-nav-login>${t('Masuk','Login')}</span></a><a class="btn primary" href="register.html"><i class="fa-solid fa-user-plus"></i><span data-nav-register>${t('Daftar','Register')}</span></a></div>`}
    </div>
  </div></header>
  ${loggedIn ? `<nav class="bottom-nav" aria-label="Quick navigation">
    <a class="${page==='dashboard'?'active':''}" href="dashboard.html"><i class="fa-solid fa-gauge-high"></i><span data-nav-bottom="dashboard">${t('Dashboard','Dashboard')}</span></a>
    <a href="dashboard.html#videoList"><i class="fa-solid fa-folder-open"></i><span data-nav-bottom="files">${t('File saya','My files')}</span></a>
    <a href="dashboard.html#upload"><i class="fa-solid fa-cloud-arrow-up"></i><span data-nav-bottom="upload">${t('Unggah','Upload')}</span></a>
    <a href="dashboard.html#searchPanel"><i class="fa-solid fa-magnifying-glass"></i><span data-nav-bottom="search">${t('Cari','Search')}</span></a>
    <a href="dashboard.html#profilePanel"><i class="fa-solid fa-user"></i><span data-nav-bottom="profile">${t('Profil','Profile')}</span></a>
  </nav>` : ''}`;
  function setLanguage(lang) {
    try { localStorage.setItem(languageKey, lang); } catch (_) {}
    document.documentElement.lang = lang;
    mount.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const pairs = {
      '[data-nav-login]': ['Masuk','Login'], '[data-nav-register]': ['Daftar','Register'],
      '[data-nav-dashboard]': ['Dashboard','Dashboard'],
      '[data-nav-bottom="dashboard"]': ['Dashboard','Dashboard'], '[data-nav-bottom="files"]': ['File saya','My files'],
      '[data-nav-bottom="upload"]': ['Unggah','Upload'], '[data-nav-bottom="search"]': ['Cari','Search'],
      '[data-nav-bottom="profile"]': ['Profil','Profile']
    };
    Object.entries(pairs).forEach(([selector, words]) => { const el=mount.querySelector(selector); if(el) el.textContent=words[lang==='en'?1:0]; });
    document.dispatchEvent(new CustomEvent('jsvidey:language-change', {detail:{lang}}));
  }
  mount.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
  mount.querySelectorAll('[data-logout]').forEach(el => el.addEventListener('click', event => { event.preventDefault(); try { localStorage.removeItem('jsvidey-session'); } catch (_) {} location.href='index.html'; }));
  document.documentElement.lang = langNow();
})();