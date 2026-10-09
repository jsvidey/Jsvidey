(() => {
  const $ = s => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();
  function showMessage(message, type = "info") {
    const box = $("#authMessage");
    if (!box) return;
    box.className = `auth-message show ${type}`;
    box.textContent = message;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  $$safe('[data-toggle]').forEach(button => button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.toggle);
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.innerHTML = `<i class="fa-regular ${reveal ? "fa-eye-slash" : "fa-eye"}"></i>`;
    button.setAttribute("aria-label", reveal ? "Sembunyikan password" : "Tampilkan password");
  }));
  function $$safe(selector) { return [...document.querySelectorAll(selector)]; }

  $("#themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const light = document.body.classList.contains("light");
    $("#themeToggle").innerHTML = `<i class="fa-solid ${light ? "fa-moon" : "fa-sun"}"></i>`;
    try { localStorage.setItem("jsvidey-theme", light ? "light" : "dark"); } catch (_) {}
  });
  try {
    if (localStorage.getItem("jsvidey-theme") === "light") {
      document.body.classList.add("light");
      $("#themeToggle").innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  } catch (_) {}

  $("#googleBtn")?.addEventListener("click", () => showMessage("Login Google belum diaktifkan. Kita sambungkan setelah konfigurasi autentikasi siap.", "info"));
  $("#forgotLink")?.addEventListener("click", e => {
    e.preventDefault();
    showMessage("Pemulihan password akan tersedia setelah autentikasi dikonfigurasi.", "info");
  });
  ["termsLink", "privacyLink"].forEach(id => $("#" + id)?.addEventListener("click", e => {
    e.preventDefault(); showMessage("Halaman kebijakan akan dibuat sebelum website dipublikasikan untuk pengguna.", "info");
  }));

  const password = $("#password");
  const meter = $("#passwordMeter");
  const hint = $("#passwordHint");
  if (password && meter && hint) password.addEventListener("input", () => {
    const value = password.value;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    [...meter.children].forEach((bar, i) => bar.classList.toggle("on", i < score));
    const labels = ["Belum diisi", "Lemah — tambah panjang password", "Cukup — kombinasikan huruf besar/kecil", "Bagus — tambahkan simbol bila bisa", "Kuat — kombinasi password baik"];
    hint.textContent = labels[value ? score : 0];
  });

  $("#signinForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const pass = $("#password").value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage("Masukkan alamat email yang valid.", "error");
    if (!pass) return showMessage("Masukkan password terlebih dahulu.", "error");
    showMessage("Form valid, tetapi login belum aktif karena backend autentikasi belum dikonfigurasi. Password tidak dikirim.", "info");
  });
  $("#signupForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const username = $("#username").value.trim();
    const email = $("#email").value.trim();
    const pass = $("#password").value;
    const confirm = $("#confirmPassword").value;
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return showMessage("Username harus 3–24 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage("Masukkan alamat email yang valid.", "error");
    if (pass.length < 8) return showMessage("Password harus minimal 8 karakter.", "error");
    if (pass !== confirm) return showMessage("Konfirmasi password belum cocok.", "error");
    if (!$("#terms").checked) return showMessage("Centang persetujuan syarat terlebih dahulu.", "error");
    showMessage("Form valid, tetapi pendaftaran belum aktif karena backend autentikasi belum dikonfigurasi. Data tidak disimpan.", "info");
  });
})();