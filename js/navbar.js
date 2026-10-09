(() => {
  const mount = document.getElementById("navbarMount");
  if (!mount) return;
  const isLoggedIn = () => {
    try { return Boolean(localStorage.getItem("jsvidey-session")); } catch (_) { return false; }
  };
  const loggedIn = isLoggedIn();
  document.body.classList.toggle("js-logged-in", loggedIn);
  const page = document.body.dataset.page || "";
  const active = (href) => ((page === "dashboard" && href === "dashboard.html") || (page === "home" && href === "index.html")) ? "active" : "";
  const links = loggedIn ? [
    ["dashboard.html","fa-gauge-high","Dashboard"],["dashboard.html#videoList","fa-film","My video"],["dashboard.html#upload","fa-cloud-arrow-up","Upload videos"],["dashboard.html#leaderboard","fa-ranking-star","Leaderboard"],["dashboard.html#withdraw","fa-money-bill-transfer","Withdraw"],["dashboard.html#searchPanel","fa-magnifying-glass","Search"],["dashboard.html#profilePanel","fa-gear","Settings"],["#logout","fa-right-from-bracket","Log out"]
  ] : [];
  mount.innerHTML = `<header class="site-navbar"><div class="nav-inner">
    <a class="brand" href="index.html" aria-label="Jsvidey home"><span class="brand-mark"><i class="fa-solid fa-play"></i></span><span>Jsvidey</span></a>
    <nav class="nav-links" id="topNavLinks" aria-label="Main navigation">
      ${loggedIn ? links.map(([href,icon,label]) => `<a class="${active(href)}" href="${href}" ${href==="#logout"?'data-logout="true"':''}><i class="fa-solid ${icon}"></i>${label}</a>`).join("") : ""}
    </nav>
    <div class="nav-actions">${loggedIn ? `<a class="btn secondary desktop-dashboard" href="dashboard.html"><i class="fa-solid fa-gauge-high"></i><span data-i18n="dashboard">Dashboard</span></a>` : `<div class="nav-auth-only"><a class="btn secondary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> <span data-i18n="login">Login</span></a><a class="btn primary" href="register.html"><i class="fa-solid fa-user-plus"></i> <span data-i18n="register">Register</span></a></div>`}
    <label class="language-picker" aria-label="Language"><i class="fa-solid fa-language"></i><select id="languageSelect" aria-label="Language"><option value="id">ID</option><option value="en">EN</option></select></label></div>
    <button class="nav-toggle" id="navToggle" type="button" aria-label="Buka menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
  </div></header>
  ${loggedIn ? `<nav class="bottom-nav" aria-label="Quick navigation">
    <a class="${loggedIn?'active':''}" href="${loggedIn?'dashboard.html':'login.html'}"><i class="fa-solid fa-gauge-high"></i><span>Dashboard</span></a>
    <a href="${loggedIn?'dashboard.html#videoList':'login.html'}"><i class="fa-solid fa-folder-open"></i><span>My file</span></a>
    <a href="${loggedIn?'dashboard.html#upload':'login.html'}"><i class="fa-solid fa-cloud-arrow-up"></i><span>Upload</span></a>
    <a href="${loggedIn?'dashboard.html#searchPanel':'login.html'}"><i class="fa-solid fa-magnifying-glass"></i><span>Search</span></a>
    <a href="${loggedIn?'dashboard.html#profilePanel':'login.html'}"><i class="fa-solid fa-user"></i><span>Profil</span></a>
  </nav>` : ""}
  `;
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("topNavLinks");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  mount.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", event => {
    event.preventDefault();
    try { localStorage.removeItem("jsvidey-session"); } catch (_) {}
    location.href = "index.html";
  }));
})();