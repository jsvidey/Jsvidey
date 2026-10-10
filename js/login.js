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
  // Paste the Supabase Project URL and anon/publishable key from Project Settings > API.
  const SUPABASE_URL = "https://yihtsjscgwaaxyfkdlos.supabase.co";
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
  const form = document.getElementById("loginForm");
  const showMessage = (message, success = false) => {
    const el = document.getElementById("loginMessage");
    el.className = success ? "form-message success" : "form-message";
    el.textContent = message;
  };
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const lang = localStorage.getItem("jsvidey-language") || "id";
    if (!email || !password) return showMessage(lang === "en" ? "Enter your email and password." : "Isi email dan kata sandi terlebih dahulu.");
    if (SUPABASE_URL.includes("YOUR_") || SUPABASE_ANON_KEY.includes("YOUR_")) {
      return showMessage(lang === "en" ? "Supabase is not configured yet. Add your Project URL and anon key in js/login.js." : "Supabase belum dikonfigurasi. Isi Project URL dan anon key di js/login.js.");
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const { data, error } = await window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY).auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data.user;
      const { data: profile } = await window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY).from("profiles").select("username, display_name").eq("id", user.id).maybeSingle();
      localStorage.setItem("jsvidey-session", JSON.stringify({ id: user.id, name: profile?.display_name || profile?.username || user.user_metadata?.username || email.split("@")[0], username: profile?.username || user.user_metadata?.username || "", email: user.email, at: Date.now() }));
      showMessage(lang === "en" ? "Login successful. Opening dashboard..." : "Berhasil masuk. Membuka dashboard...", true);
      setTimeout(() => location.href = "dashboard.html", 500);
    } catch (error) {
      const message = error?.message || "Login failed.";
      showMessage(lang === "en" ? (message.includes("Invalid login credentials") ? "Email or password is incorrect." : `Login failed: ${message}`) : (message.includes("Invalid login credentials") ? "Email atau kata sandi salah." : `Gagal masuk: ${message}`));
    } finally { submit.disabled = false; }
  });
})();
