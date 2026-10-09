(() => {
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