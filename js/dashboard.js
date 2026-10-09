(() => {
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
      return;
    }
    list.innerHTML = filtered.map(v => `<div class="video-item"><span class="video-thumb"><i class="fa-solid fa-file-video"></i></span><div><strong>${escapeHtml(v.title)}</strong><small>${escapeHtml(v.filename)} · Disiapkan di browser</small></div></div>`).join("");
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