(() => {
  const dict = {
    id: {
      footerTag: "Platform video untuk kreator.",
      footerExplore: "Jelajahi", footerAccount: "Akun", footerHome: "Beranda",
      footerVideos: "Jelajahi video", footerSignIn: "Masuk", footerSignUp: "Daftar",
      footerNote: "Upload. Bagikan. Bangun peluang.",
      langLabel: "Bahasa", home: "Beranda", explore: "Jelajahi",
      income: "Penghasilan", login: "Masuk", register: "Daftar", upload: "Upload Video",
      signInTitle: "Selamat datang", signInDesc: "Masukkan detail akun untuk melanjutkan.",
      signUpTitle: "Buat akun gratis", signUpDesc: "Isi detail di bawah untuk memulai."
    },
    en: {
      footerTag: "Video platform for creators.",
      footerExplore: "Explore", footerAccount: "Account", footerHome: "Home",
      footerVideos: "Explore videos", footerSignIn: "Sign in", footerSignUp: "Sign up",
      footerNote: "Upload. Share. Build your opportunities.",
      langLabel: "Language", home: "Home", explore: "Explore",
      income: "Earnings", login: "Sign in", register: "Sign up", upload: "Upload video",
      signInTitle: "Welcome back", signInDesc: "Enter your account details to continue.",
      signUpTitle: "Create a free account", signUpDesc: "Fill in your details to get started."
    }
  };
  const current = () => { try { return localStorage.getItem("jsvidey-language") || "id"; } catch (_) { return "id"; } };
  function setLanguage(lang) {
    lang = lang === "en" ? "en" : "id";
    try { localStorage.setItem("jsvidey-language", lang); } catch (_) {}
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[lang][key]) el.textContent = dict[lang][key];
    });
    document.querySelectorAll(".jsvidey-language").forEach(el => { el.textContent = lang.toUpperCase(); el.setAttribute("aria-label", dict[lang].langLabel); });
    document.querySelectorAll("[data-lang-placeholder]").forEach(el => {
      const key = el.getAttribute("data-lang-placeholder");
      const val = el.getAttribute("data-placeholder-" + lang);
      if (val) el.placeholder = val;
    });
  }
  function mountFooter() {
    if (document.querySelector("[data-jsvidey-footer]")) return;
    const footer = document.createElement("footer");
    footer.className = "jsvidey-footer";
    footer.setAttribute("data-jsvidey-footer", "");
    footer.innerHTML = `
      <a class="jsf-brand" href="index.html"><span class="jsf-mark"><i class="fa-solid fa-play"></i></span><span>JS<span>Videy</span><small data-i18n="footerTag">Platform video untuk kreator.</small></span></a>
      <div class="jsf-group"><strong data-i18n="footerExplore">Jelajahi</strong><a href="index.html" data-i18n="footerHome">Beranda</a><a href="index.html#explore" data-i18n="footerVideos">Jelajahi video</a></div>
      <div class="jsf-group"><strong data-i18n="footerAccount">Akun</strong><a href="signin.html" data-i18n="footerSignIn">Masuk</a><a href="signup.html" data-i18n="footerSignUp">Daftar</a></div>
      <div class="jsf-end"><button class="jsvidey-language" type="button" aria-label="Bahasa">ID</button><span data-i18n="footerNote">Upload. Bagikan. Bangun peluang.</span><small>© <span class="jsf-year"></span> JSVidey</small></div>`;
    document.body.appendChild(footer);
    footer.querySelector(".jsf-year").textContent = new Date().getFullYear();
    footer.querySelector(".jsvidey-language").addEventListener("click", () => setLanguage(current() === "id" ? "en" : "id"));
  }
  const style = document.createElement("style");
  style.textContent = `
    .jsvidey-footer{width:min(1160px,calc(100% - 40px));margin:48px auto 0;padding:28px 0 25px;border-top:1px solid var(--line,rgba(255,255,255,.1));display:flex;align-items:center;justify-content:space-between;gap:26px;color:var(--muted,#9696aa);font:12px/1.6 'DM Sans',sans-serif}
    .jsf-brand{display:flex;align-items:center;gap:10px;color:var(--text,#f8fafc);font-weight:800;font-size:18px;letter-spacing:-.5px;text-decoration:none}.jsf-brand>span:last-child>span{color:#60a5fa}.jsf-brand small{display:block;color:var(--muted,#9696aa);font-size:10px;font-weight:400;letter-spacing:0}.jsf-mark{width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#60a5fa,#2563eb 58%,#06b6d4);display:grid;place-items:center;color:white;font-size:13px}
    .jsf-group{display:grid;gap:5px;min-width:95px}.jsf-group strong{color:var(--text,#f8fafc);font-size:11px;margin-bottom:3px}.jsf-group a{color:inherit;text-decoration:none;font-size:11px}.jsf-group a:hover{color:#60a5fa}.jsf-end{display:grid;justify-items:end;gap:4px;text-align:right;font-size:10px}.jsf-end small{opacity:.7}.jsvidey-language{border:1px solid var(--line,rgba(255,255,255,.1));background:var(--panel,#12121c);color:var(--text,#f8fafc);border-radius:9px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer}
    @media(max-width:650px){.jsvidey-footer{flex-wrap:wrap;justify-content:space-between;gap:20px}.jsf-brand{width:100%}.jsf-group{flex:1}.jsf-end{margin-left:auto}}
  `;
  document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { mountFooter(); setLanguage(current()); });
  else { mountFooter(); setLanguage(current()); }
})();