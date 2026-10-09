(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const modal = $("#uploadModal"), form = $("#uploadForm"), fileInput = $("#videoFile");
  const preview = $("#videoPreview"), filePrompt = $("#filePrompt"), grid = $("#videoGrid");
  let previewUrl = null, toastTimer = null, selectedFile = null, userVideos = 0, activeCategory = "Semua";

  $("#year").textContent = new Date().getFullYear();

  function toast(message, icon = "fa-circle-check") {
    const node = $("#toast");
    node.querySelector("i").className = `fa-solid ${icon}`;
    $("#toastText").textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 3000);
  }

  function openModal() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#videoTitle").focus(), 60);
  }
  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
  ["#topUpload", "#heroUpload", "#creatorUpload", "#mobileUpload"].forEach(sel => {
    const button = $(sel);
    if (button) button.addEventListener("click", openModal);
  });
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

  $("#chooseFile").addEventListener("click", () => fileInput.click());
  $("#dropzone").addEventListener("click", e => {
    if (e.target.closest("button") || e.target.closest("video")) return;
    fileInput.click();
  });
  fileInput.addEventListener("change", () => setSelectedFile(fileInput.files[0]));
  function setSelectedFile(file) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast("Pilih file video yang valid.", "fa-triangle-exclamation"); return;
    }
    selectedFile = file;
    filePrompt.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    preview.classList.remove("hidden");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
  }
  const dz = $("#dropzone");
  ["dragenter", "dragover"].forEach(evt => dz.addEventListener(evt, e => {
    e.preventDefault(); dz.style.borderColor = "#c4b5fd"; dz.style.background = "#8b5cf621";
  }));
  ["dragleave", "drop"].forEach(evt => dz.addEventListener(evt, e => {
    e.preventDefault(); dz.style.borderColor = ""; dz.style.background = "";
  }));
  dz.addEventListener("drop", e => {
    const file = [...(e.dataTransfer?.files || [])].find(f => f.type.startsWith("video/"));
    if (file) setSelectedFile(file);
    else toast("Tarik file video ke area upload.", "fa-triangle-exclamation");
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#videoTitle").value.trim();
    if (!title) return toast("Isi judul video terlebih dahulu.", "fa-triangle-exclamation");
    if (!selectedFile) return toast("Pilih file video terlebih dahulu.", "fa-triangle-exclamation");
    const category = $("#videoCategory").value;
    const card = document.createElement("article");
    card.className = "video-card user-video";
    card.dataset.title = title.toLowerCase();
    card.dataset.category = category;
    const cover = document.createElement("div");
    cover.className = "video-cover cover-one";
    cover.innerHTML = '<span class="cover-category"></span><span class="cover-duration">LOCAL</span>';
    cover.querySelector(".cover-category").textContent = category;
    const video = document.createElement("video");
    video.src = previewUrl;
    video.controls = true;
    video.playsInline = true;
    video.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;background:#08080d";
    cover.appendChild(video);
    const info = document.createElement("div");
    info.className = "video-info";
    const avatar = document.createElement("div");
    avatar.className = "creator-avatar ca-purple";
    avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    const meta = document.createElement("div");
    meta.className = "video-meta";
    const heading = document.createElement("h3"); heading.textContent = title;
    const owner = document.createElement("p"); owner.textContent = "Pratinjau lokal · belum dipublikasikan";
    const stats = document.createElement("div"); stats.className = "video-stats";
    stats.innerHTML = '<span><i class="fa-solid fa-hard-drive"></i> Lokal</span><span><i class="fa-solid fa-circle-info"></i> Demo</span>';
    meta.append(heading, owner, stats);
    const share = document.createElement("button");
    share.className = "share-btn"; share.setAttribute("aria-label", "Bagikan video");
    share.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
    share.addEventListener("click", () => shareVideo(title));
    info.append(avatar, meta, share); card.append(cover, info);
    grid.prepend(card);
    userVideos++;
    $("#videoCount").textContent = String(userVideos);
    closeModal();
    form.reset(); selectedFile = null; fileInput.value = "";
    preview.classList.add("hidden"); preview.removeAttribute("src");
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
    filePrompt.textContent = "Pilih video atau tarik ke sini";
    filterVideos();
    toast("Ditambahkan ke pratinjau lokal. Belum diunggah ke server.");
  });

  async function shareVideo(title) {
    const shareData = { title: `JSVidey — ${title}`, text: `Lihat video "${title}" di JSVidey`, url: location.href.split("#")[0] };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.text}: ${shareData.url}`);
        toast("Teks berbagi disalin. Link video publik belum tersedia.", "fa-copy");
      } else toast("Browser ini tidak mendukung berbagi otomatis.", "fa-circle-info");
    } catch (err) {
      if (err.name !== "AbortError") toast("Belum bisa membuka fitur berbagi.", "fa-triangle-exclamation");
    }
  }
  $$(".share-btn[data-share]").forEach(btn => btn.addEventListener("click", () => shareVideo(btn.dataset.share)));

  $("#searchInput").addEventListener("input", filterVideos);
  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => c.classList.remove("selected"));
    chip.classList.add("selected");
    activeCategory = chip.dataset.category;
    filterVideos();
  }));
  function filterVideos() {
    const q = $("#searchInput").value.trim().toLowerCase();
    let visible = 0;
    $$(".video-card", grid).forEach(card => {
      const matchesText = (card.dataset.title || "").toLowerCase().includes(q) ||
        (card.textContent || "").toLowerCase().includes(q);
      const matchesCategory = activeCategory === "Semua" || card.dataset.category === activeCategory;
      const show = matchesText && matchesCategory;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    $("#emptyState").classList.toggle("hidden", visible > 0);
  }

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    const light = document.body.classList.contains("light");
    $("#themeToggle").innerHTML = `<i class="fa-solid ${light ? "fa-moon" : "fa-sun"}"></i>`;
    $("#themeToggle").setAttribute("aria-label", light ? "Gunakan tema gelap" : "Gunakan tema terang");
    try { localStorage.setItem("jsvidey-theme", light ? "light" : "dark"); } catch (_) {}
  });
  try {
    if (localStorage.getItem("jsvidey-theme") === "light") {
      document.body.classList.add("light");
      $("#themeToggle").innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  } catch (_) {}

  $("#mobileMenu").addEventListener("click", () => {
    const nav = $(".desktop-nav");
    const isOpen = nav.style.display === "flex";
    nav.style.cssText = isOpen ? "" : "display:flex;position:absolute;top:67px;left:12px;right:12px;flex-direction:column;align-items:stretch;padding:10px;background:var(--panel);border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow)";
    if (!isOpen) $$(".nav-link", nav).forEach(link => link.addEventListener("click", () => { nav.style.cssText = ""; }, { once: true }));
  });
})();