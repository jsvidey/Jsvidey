(() => {
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