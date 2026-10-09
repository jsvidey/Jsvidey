(() => {
  const pageTranslations = {"Masuk ke Jsvidey": "Log in to Jsvidey", "Lanjutkan perjalanan kreatormu.": "Continue your creator journey.", "Kata sandi": "Password", "Masukkan kata sandi": "Enter your password", "Tampilkan kata sandi": "Show password", "Masuk": "Login", "Belum punya akun?": "Don’t have an account?", "Daftar": "Register", "Video kamu.": "Your videos.", "Ruang kamu.": "Your space.", "Upload, share, pantau performa, dan kelola konten dari satu tempat.": "Upload, share, track performance, and manage content in one place.", "Demo tampilan: login ini menyimpan status lokal di browser, belum terhubung ke server autentikasi.": "UI demo: this login stores a local browser session and is not connected to server authentication.", "Isi email dan kata sandi terlebih dahulu.": "Enter your email and password first.", "Email tidak ditemukan pada data demo di browser ini. Silakan daftar terlebih dahulu.": "Email not found in this browser demo. Please register first.", "Kata sandi tidak sesuai dengan data demo.": "Password does not match the demo account.", "Berhasil masuk. Membuka dashboard...": "Login successful. Opening dashboard..."};
  const applyPageLanguage = (lang) => {
    const reverse = Object.fromEntries(Object.entries(pageTranslations).map(([id,en])=>[en,id]));
    const map = lang === 'en' ? pageTranslations : reverse;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { const original=node.nodeValue; const key=original.trim(); if(map[key]) node.nodeValue=original.replace(key,map[key]); });
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{ const val=el.getAttribute('placeholder'); const next=map[val]; if(next)el.setAttribute('placeholder',next); });
    document.querySelectorAll('[aria-label]').forEach(el=>{ const val=el.getAttribute('aria-label'); if(map[val])el.setAttribute('aria-label',map[val]); });
  };
  let currentPageLang='id'; try{currentPageLang=localStorage.getItem('jsvidey-language')||'id'}catch(_){}
  applyPageLanguage(currentPageLang);
  document.addEventListener('jsvidey:language-change', e => applyPageLanguage(e.detail.lang));

  document.querySelectorAll("[data-reveal]").forEach(button => button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.reveal);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    button.innerHTML = input.type === "password" ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
  }));
  const form = document.getElementById("loginForm");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    if (!email || !password) { message.textContent = "Isi email dan kata sandi terlebih dahulu."; return; }
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem("jsvidey-demo-user") || "null"); } catch (_) {}
    if (stored && stored.email.toLowerCase() !== email.toLowerCase()) {
      message.textContent = "Email tidak ditemukan pada data demo di browser ini. Silakan daftar terlebih dahulu.";
      return;
    }
    if (stored && stored.password !== password) {
      message.textContent = "Kata sandi tidak sesuai dengan data demo.";
      return;
    }
    const session = {name: stored?.name || email.split("@")[0], email, at: Date.now()};
    try { localStorage.setItem("jsvidey-session", JSON.stringify(session)); } catch (_) {}
    message.className = "form-message success";
    message.textContent = "Berhasil masuk. Membuka dashboard...";
    setTimeout(() => location.href = "dashboard.html", 450);
  });
})();