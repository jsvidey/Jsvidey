(() => {
  const mount=document.getElementById('navbarMount'); if(!mount)return;
  const langKey='jsvidey-language';
  const getLang=()=>{try{return localStorage.getItem(langKey)||'id'}catch(_){return'id'}};
  const t=(id,en)=>getLang()==='en'?en:id;
  const loggedIn=()=>{try{return Boolean(localStorage.getItem('jsvidey-session'))}catch(_){return false}};
  const logged=loggedIn(),page=document.body.dataset.page||'';
  document.body.classList.toggle('jsvidey-logged-in',logged);
  const navItems=[
    ['dashboard.html','gauge-high','Dashboard','Dashboard'],
    ['dashboard.html#upload','cloud-arrow-up','Upload video','Unggah video'],
    ['dashboard.html#myFile','folder-open','My file','File saya'],
    ['dashboard.html#leaderboard','ranking-star','Leaderboard','Papan peringkat'],
    ['dashboard.html#searchPanel','magnifying-glass','Search','Cari'],
    ['dashboard.html#settings','gear','Settings','Pengaturan']
  ];
  const drawerLinks=logged?navItems.map(([href,icon,en,id])=>`<a class="drawer-link ${page==='dashboard'&&href==='dashboard.html'?'active':''}" href="${href}"><i class="fa-solid fa-${icon}"></i><span>${t(id,en)}</span><i class="fa-solid fa-arrow-up-right-from-square drawer-arrow"></i></a>`).join(''):'';
  mount.innerHTML=`
  <header class="site-navbar"><div class="nav-inner">
    <a class="brand" href="index.html" aria-label="Jsvidey home"><span class="brand-mark"><i class="fa-solid fa-play"></i></span><span>Jsvidey</span></a>
    <div class="nav-actions">
      ${logged?`<button class="btn secondary translate-menu-trigger" id="openNavDrawer" type="button" aria-expanded="false"><i class="fa-solid fa-language"></i><span>Translate</span><i class="fa-solid fa-chevron-down trigger-chevron"></i></button>`:`<div class="language-switch" role="group" aria-label="Language"><button type="button" data-lang="id" aria-pressed="${getLang()==='id'}">ID</button><span>/</span><button type="button" data-lang="en" aria-pressed="${getLang()==='en'}">EN</button></div><a class="btn secondary" href="login.html">${t('Masuk','Login')}</a><a class="btn primary" href="register.html">${t('Daftar','Register')}</a>`}
    </div>
  </div></header>
  ${logged?`<div class="drawer-backdrop" id="navBackdrop"></div><aside class="nav-drawer" id="navDrawer" aria-hidden="true"><div class="drawer-head"><div><span class="drawer-eyebrow">JSVIDEY</span><h2>${t('Menu kreator','Creator menu')}</h2></div><button type="button" class="drawer-close" id="closeNavDrawer" aria-label="${t('Tutup menu','Close menu')}"><i class="fa-solid fa-xmark"></i></button></div><div class="drawer-language"><span><i class="fa-solid fa-globe"></i> ${t('Bahasa','Language')}</span><div class="drawer-lang-options"><button type="button" data-lang="id" aria-pressed="${getLang()==='id'}">Indonesia</button><button type="button" data-lang="en" aria-pressed="${getLang()==='en'}">English</button></div></div><nav class="drawer-menu" aria-label="Creator menu">${drawerLinks}</nav><button type="button" class="drawer-logout" id="drawerLogout"><i class="fa-solid fa-right-from-bracket"></i><span>${t('Log out','Log out')}</span></button></aside>`:''}
  ${logged?`<nav class="bottom-nav" aria-label="Quick navigation"><a class="${page==='dashboard'?'active':''}" href="dashboard.html"><i class="fa-solid fa-gauge-high"></i><span>${t('Dashboard','Dashboard')}</span></a><a href="dashboard.html#myFile"><i class="fa-solid fa-folder-open"></i><span>${t('My file','My file')}</span></a><a href="dashboard.html#upload"><i class="fa-solid fa-cloud-arrow-up"></i><span>${t('Upload','Upload')}</span></a><a href="dashboard.html#searchPanel"><i class="fa-solid fa-magnifying-glass"></i><span>${t('Search','Search')}</span></a><a href="dashboard.html#settings"><i class="fa-solid fa-gear"></i><span>${t('Settings','Settings')}</span></a></nav>`:''}`;
  const drawer=mount.querySelector('#navDrawer'),backdrop=mount.querySelector('#navBackdrop'),trigger=mount.querySelector('#openNavDrawer');
  function openDrawer(){if(!drawer)return;drawer.classList.add('open');backdrop.classList.add('visible');drawer.setAttribute('aria-hidden','false');trigger?.setAttribute('aria-expanded','true');document.body.classList.add('drawer-open');}
  function closeDrawer(){if(!drawer)return;drawer.classList.remove('open');backdrop.classList.remove('visible');drawer.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');document.body.classList.remove('drawer-open');}
  trigger?.addEventListener('click',()=>drawer.classList.contains('open')?closeDrawer():openDrawer());
  mount.querySelector('#closeNavDrawer')?.addEventListener('click',closeDrawer);backdrop?.addEventListener('click',closeDrawer);
  mount.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{const lang=btn.dataset.lang;try{localStorage.setItem(langKey,lang)}catch(_){}document.documentElement.lang=lang;mount.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));document.dispatchEvent(new CustomEvent('jsvidey:language-change',{detail:{lang}}));location.reload();}));
  function logout(){document.dispatchEvent(new CustomEvent('jsvidey:logout'));}
  mount.querySelector('#drawerLogout')?.addEventListener('click',logout);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  document.documentElement.lang=getLang();
})();