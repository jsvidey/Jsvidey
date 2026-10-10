# Jsvidey Dashboard + Real Database

## Yang berubah
- Navbar atas menggunakan tombol **Translate** yang membuka slide-out menu: Dashboard, Upload video, My file, Leaderboard, Search, Settings, Log out.
- Navbar bawah tampil pada sesi login.
- Dashboard dirapikan mengikuti layout Welcome / Videos / Viewers / Earned / Overview / Online / Views / Avg. CPM / Revenue / This Week / Last Week / Balance / Daily Rank / Leaderboard / Statistics / Top Videos.
- Dashboard mengambil profil, daftar video, penayangan, penghasilan, saldo, dan leaderboard dari Supabase.
- Terjemahan Indonesia/Inggris disimpan langsung dalam `js/dashboard.js` dan pilihan bahasa ada di `js/navbar.js`; tidak ada `translate.js`.

## Cara pasang
1. Upload/ganti file di folder `Jsvidey-main` ke repository.
2. Di Supabase SQL Editor jalankan `sql/jsvidey_auth.sql` terlebih dahulu jika belum pernah dijalankan.
3. Lalu jalankan seluruh `sql/jsvidey_dashboard.sql`.
4. Pastikan Project URL dan publishable/anon key di `js/login.js`, `js/register.js`, dan `js/dashboard.js` mengarah ke proyek Supabase yang sama.
5. Push ke GitHub dan tunggu Cloudflare Pages selesai deploy.

## Database
- `profiles`: profil/username/plan/tanggal bergabung.
- `videos`: metadata video per kreator.
- `video_views`: event/rekap penayangan.
- `creator_earnings`: catatan pendapatan yang tercatat.
- `creator_wallets`: saldo tersedia.
- `creator_video_views` dan `creator_leaderboard`: view untuk dashboard.

## Penting
Dashboard hanya menampilkan angka yang benar-benar tercatat di tabel. Viewers online dihitung dari catatan view dalam lima menit terakhir; angka ini hanya bermakna jika sistem pemutar video nanti mencatat event ke `video_views`. CPM dan pendapatan tidak dibuat otomatis dari jumlah views; hanya catatan yang ada di `creator_earnings` yang dihitung. Jangan memasukkan pendapatan atau saldo secara langsung dari browser. Untuk produksi, penambahan views, earnings, dan wallet harus melalui Edge Function/backend tepercaya dengan validasi anti-fraud. Form Upload video saat ini menyimpan metadata (judul/URL/status) ke database, belum mengirim file video ke storage. Integrasi Backblaze B2 akan dibuat pada tahap terpisah.


## Security Advisor fix: creator_leaderboard

The dashboard migration now creates `public.creator_leaderboard` with
`security_invoker = true`. If the migration has already been run on Supabase,
run `sql/fix_creator_leaderboard_security.sql` in the Supabase SQL Editor,
then re-run Security Advisor.

Important: invoker mode honors the caller's privileges and RLS on base tables.
If a global leaderboard should show other creators, expose only approved public
profile fields and aggregate statistics through an intentionally designed policy
or a trusted backend. Do not expose wallet balances or private earnings to make
the leaderboard populate.


## Halaman kreator dipisah
- `dashboard.html`: ringkasan statistik dan video teratas saja.
- `upload.html`: formulir metadata unggahan.
- `my-file.html`: daftar video akun.
- `search.html`: pencarian video akun.
- `leaderboard.html`: papan peringkat.
- `settings.html`: informasi akun/pengaturan.
- `withdraw.html`: tampilan saldo. Fitur permintaan withdraw sengaja belum diaktifkan sampai tabel withdraw dan alur persetujuan backend disiapkan.
Setiap halaman menggunakan file JS pendampingnya sendiri di folder `js/`.
