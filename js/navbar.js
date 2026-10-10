(() => {
  const mount=document.getElementById('navbarMount'); if(!mount)return;
  const langKey='jsvidey-language';
  const getLang=()=>{try{return localStorage.getItem(langKey)||'id'}catch(_){return'id'}};
  const t=(id,en)=>getLang()==='en'?en:id;
  const loggedIn=()=>{try{return Boolean(localStorage.getItem('jsvidey-session'))}catch(_){return false}};
  const logged=loggedIn(),page=document.body.dataset.page||'';
  document.body.classList.toggle('jsvidey-logged-in',logged);
  const navItems=[
    ['dashboard.html','gauge-high','Dashboard','Dashboard','Account summary, statistics, performance, balance, and top videos.','Ringkasan akun, statistik, performa, saldo, dan video teratas.'],
    ['upload.html','cloud-arrow-up','Upload video','Unggah video','Upload a video or save its details.','Unggah video atau simpan detail video.'],
    ['my-file.html','folder-open','My file','File saya','Browse videos belonging to your account.','Daftar video milik akun pengguna.'],
    ['leaderboard.html','ranking-star','Leaderboard','Leaderboard','Creator rankings, views, and recorded earnings.','Peringkat kreator, penayangan, dan pendapatan tercatat.'],
    ['search.html','magnifying-glass','Search','Cari','Search videos in your collection.','Pencarian video pada koleksi akun.'],
    ['withdraw.html','wallet','Withdraw','Withdraw','Manage your balance and withdrawals.','Kelola saldo dan penarikan dana.'],
    ['settings.html','gear','Settings','Pengaturan','Manage your profile, email, and account plan.','Informasi profil, email, dan paket akun.']
  ];
  const drawerLinks=logged?navItems.map(([href,icon,en,id,enDesc,idDesc])=>`<a class="drawer-link ${((page==='dashboard'&&href==='dashboard.html')||(page==='upload'&&href==='upload.html')||(page==='my-file'&&href==='my-file.html')||(page==='leaderboard'&&href==='leaderboard.html')||(page==='search'&&href==='search.html')||(page==='settings'&&href==='settings.html')||(page==='withdraw'&&href==='withdraw.html'))?'active':''}" href="${href}"><i class="fa-solid fa-${icon}"></i><span class="drawer-link-copy"><strong>${t(id,en)}</strong><small>${t(idDesc,enDesc)}</small></span><i class="fa-solid fa-arrow-up-right-from-square drawer-arrow"></i></a>`).join(''):'';
  mount.innerHTML=`
  <header class="site-navbar"><div class="nav-inner">
    <a class="brand" href="dashboard.html" aria-label="Jsvidey home"><span class="brand-mark"><i class="fa-solid fa-play"></i></span><span>Jsvidey</span></a>
    <div class="nav-actions">
      ${logged?`<div class="top-popover-wrap"><button class="icon-nav-btn" id="languageToggle" type="button" aria-expanded="false" aria-label="${t('Ganti bahasa','Change language')}"><i class="fa-solid fa-language"></i><span>${t('Bahasa','Translate')}</span></button><div class="top-popover language-popover" id="languagePopover" hidden><strong>${t('Pilih bahasa','Choose language')}</strong><button type="button" data-lang="id" aria-pressed="${getLang()==='id'}">🇮🇩 Indonesia</button><button type="button" data-lang="en" aria-pressed="${getLang()==='en'}">🇬🇧 English</button></div></div>
      <div class="top-popover-wrap"><button class="icon-nav-btn notification-trigger" id="notificationToggle" type="button" aria-expanded="false" aria-label="${t('Notifikasi','Notifications')}"><i class="fa-regular fa-bell"></i><span class="notification-dot"></span></button><div class="top-popover notification-popover" id="notificationPopover" hidden><strong><i class="fa-regular fa-bell"></i> ${t('Notifikasi','Notifications')}</strong><div class="notification-empty"><i class="fa-regular fa-bell-slash"></i><span>${t('Belum ada notifikasi','No notifications yet')}</span></div></div></div>`:`<div class="language-switch" role="group" aria-label="Language"><button type="button" data-lang="id" aria-pressed="${getLang()==='id'}">ID</button><span>/</span><button type="button" data-lang="en" aria-pressed="${getLang()==='en'}">EN</button></div><a class="btn secondary" href="login.html">${t('Masuk','Login')}</a><a class="btn primary" href="register.html">${t('Daftar','Register')}</a>`}
    </div>
  </div></header>
  ${logged?`<div class="drawer-backdrop" id="navBackdrop"></div><aside class="nav-drawer" id="navDrawer" aria-hidden="true"><div class="drawer-head"><div><span class="drawer-eyebrow">JSVIDEY</span><h2>${t('Profil & menu','Profile & menu')}</h2></div><button type="button" class="drawer-close" id="closeNavDrawer" aria-label="${t('Tutup menu','Close menu')}"><i class="fa-solid fa-xmark"></i></button></div><div class="drawer-profile"><span class="drawer-avatar"><i class="fa-solid fa-user"></i></span><div><strong>${t('Profil kreator','Creator profile')}</strong><small>${t('Kelola akun dan preferensi','Manage account and preferences')}</small></div></div><nav class="drawer-menu" aria-label="Creator menu">${drawerLinks}</nav><button type="button" class="drawer-logout" id="drawerLogout"><i class="fa-solid fa-right-from-bracket"></i><span>${t('Log out','Log out')}</span></button></aside>`:''}
  ${logged?`<nav class="bottom-nav" aria-label="Quick navigation"><a class="${page==='dashboard'?'active':''}" href="dashboard.html"><i class="fa-solid fa-house"></i><span>Dashboard</span></a><a class="${page==='my-file'?'active':''}" href="my-file.html"><i class="fa-solid fa-folder-open"></i><span>My file</span></a><a class="${page==='upload'?'active':''}" href="upload.html"><i class="fa-solid fa-circle-plus"></i><span>${t('Upload video','Upload video')}</span></a><a class="${page==='search'?'active':''}" href="search.html"><i class="fa-solid fa-magnifying-glass"></i><span>${t('Search','Search')}</span></a><button class="bottom-profile-trigger" id="openNavDrawer" type="button" aria-expanded="false"><i class="fa-solid fa-user-circle"></i><span>${t('Profil','Profile')}</span></button></nav>`:''}`;
  const drawer=mount.querySelector('#navDrawer'),backdrop=mount.querySelector('#navBackdrop'),trigger=mount.querySelector('#openNavDrawer');
  const languageToggle=mount.querySelector('#languageToggle'),languagePopover=mount.querySelector('#languagePopover');
  const notificationToggle=mount.querySelector('#notificationToggle'),notificationPopover=mount.querySelector('#notificationPopover');
  function closePopovers(){if(languagePopover)languagePopover.hidden=true;if(notificationPopover)notificationPopover.hidden=true;languageToggle?.setAttribute('aria-expanded','false');notificationToggle?.setAttribute('aria-expanded','false')}
  languageToggle?.addEventListener('click',()=>{const opening=languagePopover.hidden;closePopovers();languagePopover.hidden=!opening;languageToggle.setAttribute('aria-expanded',String(opening));});
  notificationToggle?.addEventListener('click',()=>{const opening=notificationPopover.hidden;closePopovers();notificationPopover.hidden=!opening;notificationToggle.setAttribute('aria-expanded',String(opening));});
  document.addEventListener('click',e=>{if(!e.target.closest('.top-popover-wrap'))closePopovers()});
  function openDrawer(){if(!drawer)return;closePopovers();drawer.classList.add('open');backdrop.classList.add('visible');drawer.setAttribute('aria-hidden','false');trigger?.setAttribute('aria-expanded','true');document.body.classList.add('drawer-open');}
  function closeDrawer(){if(!drawer)return;drawer.classList.remove('open');backdrop.classList.remove('visible');drawer.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');document.body.classList.remove('drawer-open');}
  trigger?.addEventListener('click',()=>drawer.classList.contains('open')?closeDrawer():openDrawer());
  mount.querySelector('#closeNavDrawer')?.addEventListener('click',closeDrawer);backdrop?.addEventListener('click',closeDrawer);
  mount.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{const lang=btn.dataset.lang;try{localStorage.setItem(langKey,lang)}catch(_){}document.documentElement.lang=lang;document.dispatchEvent(new CustomEvent('jsvidey:language-change',{detail:{lang}}));location.reload();}));
  function logout(){document.dispatchEvent(new CustomEvent('jsvidey:logout'));}
  mount.querySelector('#drawerLogout')?.addEventListener('click',logout);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closePopovers()}});
  document.documentElement.lang=getLang();
})();