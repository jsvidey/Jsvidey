(() => {
  const pageTranslations = {"Halo,": "Hello,", "Selamat datang di ruang kreator Jsvidey. Ini ringkasan aktivitasmu.": "Welcome to your Jsvidey creator space. Here is your activity summary.", "Upload Video": "Upload Video", "Total video": "Total videos", "Total penayangan": "Total views", "Estimasi penghasilan": "Estimated earnings", "Saldo tersedia": "Available balance", "Video di akunmu": "Videos in your account", "Akumulasi views": "Total views", "Belum terhubung ke monetisasi": "Monetization not connected yet", "Saldo demo": "Demo balance", "Upload video": "Upload video", "Pilih video untuk menyiapkan unggahan.": "Choose a video to prepare an upload.", "Pilih file video": "Choose video file", "MP4, WebM, atau format yang didukung browser": "MP4, WebM, or a browser-supported format", "Judul video": "Video title", "Contoh: Video perjalanan saya": "Example: My travel video", "Siapkan video": "Prepare video", "My videos": "My videos", "Video yang ditambahkan di browser ini.": "Videos added in this browser.", "Lihat semua": "View all", "Belum ada video": "No videos yet", "Video demo yang kamu siapkan akan muncul di sini.": "Prepared demo videos will appear here.", "Menu kreator": "Creator menu", "Akses cepat fitur utama Jsvidey.": "Quick access to Jsvidey’s main features.", "My file": "My files", "Search": "Search", "Profil": "Profile", "Pilih file video terlebih dahulu.": "Please choose a video file first.", "File yang dipilih bukan video.": "The selected file is not a video.", "Video ditambahkan ke daftar demo. File belum diunggah ke server.": "Video added to the demo list. The file has not been uploaded to a server.", "Video tidak ditemukan": "No videos found", "Coba kata kunci lain.": "Try another keyword.", "Disiapkan di browser": "Prepared in browser"};
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

  let session = null;
  try { session = JSON.parse(localStorage.getItem("jsvidey-session") || "null"); } catch (_) {}
  if (!session) { location.replace("login.html"); return; }
  const name = session.name || "Creator";
  document.getElementById("welcomeName").textContent = name;
  document.getElementById("profileName").textContent = name;
  document.getElementById("profileEmail").textContent = session.email || "Belum tersedia";
  const videosKey = "jsvidey-demo-videos";
  let videos = [];
  try { videos = JSON.parse(localStorage.getItem(videosKey) || "[]"); } catch (_) {}
  const render = (filter = "") => {
    const list = document.getElementById("videoList");
    const filtered = videos.filter(v => v.title.toLowerCase().includes(filter.toLowerCase()));
    document.getElementById("statVideos").textContent = videos.length;
    document.getElementById("statViews").textContent = "0";
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-photo-film"></i><strong>${filter ? "Video tidak ditemukan" : "Belum ada video"}</strong><span>${filter ? "Coba kata kunci lain." : "Video demo yang kamu siapkan akan muncul di sini."}</span></div>`;
      applyPageLanguage(currentPageLang);
      return;
    }
    list.innerHTML = filtered.map(v => `<div class="video-item"><span class="video-thumb"><i class="fa-solid fa-file-video"></i></span><div><strong>${escapeHtml(v.title)}</strong><small>${escapeHtml(v.filename)} · Disiapkan di browser</small></div></div>`).join("");
    applyPageLanguage(currentPageLang);
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  render();
  document.getElementById("uploadForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const file = document.getElementById("videoFile").files[0];
    const title = document.getElementById("videoTitle").value.trim() || (file ? file.name.replace(/\.[^.]+$/,"") : "");
    const message = document.getElementById("uploadMessage");
    if (!file) { message.textContent = "Pilih file video terlebih dahulu."; return; }
    if (!file.type.startsWith("video/")) { message.textContent = "File yang dipilih bukan video."; return; }
    videos.unshift({title,filename:file.name,addedAt:Date.now()});
    try { localStorage.setItem(videosKey, JSON.stringify(videos)); } catch (_) {}
    render();
    message.className = "form-message success";
    message.textContent = "Video ditambahkan ke daftar demo. File belum diunggah ke server.";
    event.target.reset();
  });
  document.getElementById("videoSearch")?.addEventListener("input", event => render(event.target.value));
  document.getElementById("logoutButton")?.addEventListener("click", () => {
    try { localStorage.removeItem("jsvidey-session"); } catch (_) {}
    location.href = "index.html";
  });
  document.getElementById("openSearch")?.addEventListener("click", () => setTimeout(() => document.getElementById("videoSearch")?.focus(), 50));
})();