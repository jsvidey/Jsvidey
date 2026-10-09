(() => {
  const pageTranslations = {"Buat akun Jsvidey": "Create your Jsvidey account", "Mulai bangun ruang video dan komunitasmu.": "Start building your video space and community.", "Nama pengguna": "Username", "Kata sandi": "Password", "Minimal 8 karakter": "At least 8 characters", "Saya menyetujui ketentuan penggunaan.": "I agree to the terms of use.", "Buat Akun": "Create Account", "Sudah punya akun?": "Already have an account?", "Masuk": "Login", "Demo tampilan: data akun disimpan di browser ini saja, belum menjadi akun server.": "UI demo: account data is stored only in this browser and is not a server account.", "Buat. Bagikan.": "Create. Share.", "Tumbuh bersama.": "Grow together.", "Siapkan profil kreator, kelola video, dan pantau perkembangan kontenmu.": "Set up your creator profile, manage videos, and track your content growth.", "Nama pengguna harus 3–24 karakter: huruf, angka, atau garis bawah.": "Username must be 3–24 characters: letters, numbers, or underscores.", "Kata sandi minimal 8 karakter.": "Password must be at least 8 characters.", "Centang persetujuan ketentuan terlebih dahulu.": "Please accept the terms first.", "Browser tidak mengizinkan penyimpanan lokal.": "Your browser does not allow local storage.", "Akun demo berhasil dibuat. Membuka dashboard...": "Demo account created. Opening dashboard..."};
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
  document.getElementById("registerForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const message = document.getElementById("registerMessage");
    if (!/^[A-Za-z0-9_]{3,24}$/.test(name)) { message.textContent = "Nama pengguna harus 3–24 karakter: huruf, angka, atau garis bawah."; return; }
    if (password.length < 8) { message.textContent = "Kata sandi minimal 8 karakter."; return; }
    if (!document.getElementById("acceptTerms").checked) { message.textContent = "Centang persetujuan ketentuan terlebih dahulu."; return; }
    try {
      localStorage.setItem("jsvidey-demo-user", JSON.stringify({name,email,password}));
      localStorage.setItem("jsvidey-session", JSON.stringify({name,email,at:Date.now()}));
    } catch (_) { message.textContent = "Browser tidak mengizinkan penyimpanan lokal."; return; }
    message.className = "form-message success";
    message.textContent = "Akun demo berhasil dibuat. Membuka dashboard...";
    setTimeout(() => location.href = "dashboard.html", 450);
  });
})();