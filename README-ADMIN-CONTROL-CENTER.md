# Jsvidey Admin Control Center

Panel baru `admin.html` memakai gaya gelap, gradient, ikon Font Awesome, dan komponen yang seragam dengan dashboard Jsvidey. Panel ini memakai Supabase RPC yang memeriksa daftar admin di database; menyembunyikan link admin saja bukan kontrol keamanan.

## 1. Jalankan migrasi SQL

Di Supabase Dashboard → SQL Editor, jalankan file ini setelah migrasi aplikasi yang sudah ada:

1. `sql/jsvidey_auth.sql`
2. `sql/jsvidey_dashboard.sql`
3. `sql/jsvidey_backblaze_upload.sql`
4. `sql/jsvidey_admin_control_center.sql`

Jalankan sebagai database owner. Jangan membuat `is_admin` di `profiles` yang dapat diubah user. Panel ini memakai tabel terpisah `public.jsvidey_admins`.

## 2. Jadikan akunmu administrator

Daftarkan/login terlebih dahulu melalui aplikasi. Ambil UUID akun dari Supabase → Authentication → Users, lalu jalankan SQL berikut dengan UUID akunmu:

```sql
insert into public.jsvidey_admins (user_id)
values ('GANTI-DENGAN-UUID-AKUN-ADMIN')
on conflict (user_id) do nothing;
```

Buka `admin.html` di domain situs yang sama dan login dengan akun tersebut. Akun yang tidak terdaftar di `jsvidey_admins` akan ditolak.

## 3. Deploy Edge Functions

Untuk upload dinamis dan penghapusan objek B2, deploy kedua fungsi:

```bash
supabase login
supabase link --project-ref yihtsjscgwaaxyfkdlos
supabase functions deploy create-b2-upload-url
supabase functions deploy admin-delete-media
```

Pastikan secrets yang diperlukan sudah diset di Supabase Edge Function Secrets:

- `B2_ENDPOINT`
- `B2_REGION`
- `B2_BUCKET`
- `B2_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_PUBLIC_BASE_URL` (dibutuhkan upload/playback bucket publik)
- `APP_ORIGIN` (origin domain frontend)
- `SUPABASE_SERVICE_ROLE_KEY` (dibutuhkan untuk membaca config admin dengan aman dan menghapus objek media sebagai admin)

B2 application key untuk hapus media harus memiliki izin delete pada bucket yang dipilih. Jangan pernah menaruh B2 key atau service-role key di HTML/JavaScript frontend. Batasi key B2 ke bucket yang diperlukan.

## 4. Fitur panel

- **Media:** daftar semua media, pencarian, hapus satu media, dan hapus semua media. Edge Function mencoba menghapus objek di B2 sebelum menghapus metadata database.
- **Withdraw:** approve/reject permintaan yang ada di `public.withdraw_requests`. Approval mengurangi saldo tersedia secara transaksional hanya jika saldo cukup. Tabel/flow pengajuan withdraw pengguna perlu diintegrasikan ke halaman member agar permintaan baru tercipta.
- **Member:** lihat user, ban/unban login, dan hapus akun non-admin.
- **Pendapatan & CPM:** konfigurasi CPM dasar, persentase bagi hasil, serta penyesuaian pendapatan yang diaudit sebagai `admin_adjustment`.
- **Iklan video:** simpan konfigurasi pre-roll/mid-roll dan URL ad tag. Ini tidak otomatis menampilkan iklan sampai video player terintegrasi dengan ad SDK/VAST provider yang dipilih.
- **Storage B2:** atur maksimum ukuran satu file hingga 5000 MB dan kuota target aplikasi. Batas ini adalah konfigurasi aplikasi; kapasitas/biaya riil tetap ditentukan akun dan bucket Backblaze B2.
- **Platform:** maintenance mode, pendaftaran baru, dan notifikasi yang dapat dibaca user dari panel notifikasi navbar.

## 5. Catatan produksi penting

- Maintenance overlay dan pengaturan registrasi frontend adalah UX gate. Untuk benar-benar menghentikan akses, endpoint/API sensitif dan aturan hosting juga perlu menerapkan maintenance di server; browser-side gate sendiri dapat dilewati.
- CPM yang diatur adalah nilai konfigurasi. Pendapatan riil membutuhkan data dari jaringan iklan/analytics yang tervalidasi. Jangan menganggap tayangan biasa otomatis menjadi tayangan termonetisasi.
- Persetujuan withdraw tidak mengirim uang ke bank/e-wallet secara otomatis. Admin harus memverifikasi dan memproses pembayaran sesuai prosedur, lalu approve.
- Penghapusan akun permanen dapat menghapus data terkait sesuai foreign-key cascade. Pastikan kebijakan retensi dan backup sudah benar.
- Limit upload dinamis membutuhkan SQL migration serta redeploy `create-b2-upload-url`. Ukuran besar memerlukan browser, jaringan, CORS bucket, kuota akun B2, dan batas provider yang sesuai.
- Konfigurasi `storage_quota_gb` adalah target kuota aplikasi; belum menghitung penggunaan B2 secara langsung. Untuk angka penggunaan akurat, tambahkan job yang mengambil statistik bucket dari API Backblaze.
- Untuk notifikasi target seluruh user, pesan disimpan satu kali sebagai pengumuman global. Pesan spesifik hanya tampil ke user target.
