# Giveaway System TikTok Live

Sistem giveaway sederhana untuk TikTok Live menggunakan **Node.js**, **Express**, **Socket.IO**, dan **TikTok Live Connector**.

Project ini bisa digunakan untuk membuat giveaway otomatis berdasarkan komentar di TikTok Live. Penonton cukup mengetik keyword seperti `JOIN`, lalu username mereka otomatis masuk ke daftar peserta.

---

## Fitur

* Join otomatis dari komentar TikTok Live
* Keyword bisa diatur dari halaman admin
* Judul giveaway bisa diatur dari halaman admin
* Subtitle overlay bisa diatur dari halaman admin
* Overlay fullscreen untuk OBS atau share screen
* Daftar peserta otomatis
* Support avatar/foto profil jika tersedia
* Fallback huruf awal username jika avatar tidak tersedia
* Animasi saat peserta join
* Animasi shuffle saat memilih pemenang
* Tambah peserta manual dari admin
* Reset peserta
* Buka/tutup join

---

## Struktur Folder

```bash
giveaway-sytem/
├── public/
│   ├── admin.html
│   └── overlay.html
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## Requirement

Sebelum menjalankan project ini, pastikan sudah menginstall:

* Node.js
* NPM

Cek apakah Node.js sudah terinstall:

```bash
node -v
```

Cek apakah NPM sudah terinstall:

```bash
npm -v
```

Kalau muncul versi Node.js dan NPM, berarti sudah siap.

---

## Cara Install

Clone repository ini:

```bash
git clone https://github.com/Tirta71/giveaway-sytem.git
```

Masuk ke folder project:

```bash
cd giveaway-sytem
```

Install semua package:

```bash
npm install
```

---

## Setting Username TikTok

Buka file:

```bash
server.js
```

Cari bagian ini:

```js
const TIKTOK_USERNAME = "jaaaamm__";
```

Ganti dengan username TikTok kamu **tanpa tanda `@`**.

Contoh benar:

```js
const TIKTOK_USERNAME = "usernamekamu";
```

Contoh salah:

```js
const TIKTOK_USERNAME = "@usernamekamu";
```

> Pastikan akun TikTok tersebut sedang LIVE ketika server dijalankan.

---

## Cara Menjalankan Project

Jalankan server dengan perintah:

```bash
node server.js
```

Jika berhasil, terminal akan menampilkan kurang lebih seperti ini:

```bash
Server jalan di http://localhost:3000
Admin   : http://localhost:3000/admin.html
Overlay : http://localhost:3000/overlay.html
```

---

## Halaman Admin

Buka halaman admin di browser:

```bash
http://localhost:3000/admin.html
```

Di halaman admin kamu bisa mengatur:

* Judul giveaway
* Subtitle overlay
* Keyword join
* Buka join
* Tutup join
* Pilih pemenang
* Reset peserta
* Tambah peserta manual

Contoh pengaturan:

```txt
Judul: 🎁 GIVEAWAY 10K TOKEN
Subtitle: Ketik JOIN untuk ikut sekarang
Keyword: JOIN
```

Setelah mengubah judul, subtitle, atau keyword, klik:

```txt
Update Tampilan
```

Kalau ingin mulai menerima peserta dari komentar TikTok Live, klik:

```txt
Buka Join
```

---

## Halaman Overlay

Buka halaman overlay di browser:

```bash
http://localhost:3000/overlay.html
```

Overlay ini bisa digunakan untuk:

* Share screen saat live
* OBS Browser Source
* Tampilan giveaway fullscreen

Jika menggunakan OBS:

1. Buka OBS
2. Tambahkan source baru
3. Pilih **Browser Source**
4. Masukkan URL:

```bash
http://localhost:3000/overlay.html
```

5. Atur ukuran:

```txt
Width: 1920
Height: 1080
```

---

## Cara Giveaway Berjalan

1. Jalankan server:

```bash
node server.js
```

2. Buka halaman admin:

```bash
http://localhost:3000/admin.html
```

3. Pastikan status TikTok sudah:

```txt
Connected
```

4. Atur judul, subtitle, dan keyword.

5. Klik tombol:

```txt
Buka Join
```

6. Penonton TikTok Live mengetik keyword di chat, contoh:

```txt
JOIN
```

7. Username penonton otomatis masuk ke daftar peserta.

8. Klik tombol:

```txt
Pilih Pemenang
```

9. Overlay akan menampilkan animasi shuffle dan pemenang giveaway.

---

## Keyword Join

Keyword default:

```txt
JOIN
```

Komentar berikut tetap bisa terbaca:

```txt
join
Join
JOIN
```

Sistem otomatis mengubah komentar menjadi huruf besar, jadi tidak masalah jika penonton mengetik huruf kecil atau besar.

---

## Tambah Peserta Manual

Di halaman admin, kamu juga bisa menambahkan peserta manual.

Isi:

```txt
username tanpa @
```

Avatar bersifat optional. Jika link avatar tidak diisi, sistem akan otomatis menggunakan huruf awal username sebagai avatar fallback.

---

## Reset Peserta

Untuk menghapus semua peserta, klik:

```txt
Reset
```

Setelah reset, daftar peserta dan pemenang akan dikosongkan.

---

## Troubleshooting

### TikTok tidak connected

Pastikan:

* Username TikTok benar
* Tidak memakai tanda `@`
* Akun sedang LIVE
* Koneksi internet stabil

Contoh benar:

```js
const TIKTOK_USERNAME = "usernamekamu";
```

Contoh salah:

```js
const TIKTOK_USERNAME = "@usernamekamu";
```

---

### Peserta tidak masuk

Pastikan:

* Giveaway sudah dibuka dari admin
* Keyword di admin sama dengan komentar penonton
* Penonton mengetik keyword dengan benar

Contoh:

```txt
Keyword admin: JOIN
Komentar penonton: JOIN
```

---

### Avatar tidak muncul

Avatar hanya muncul jika data dari TikTok Live menyediakan foto profil.

Jika avatar tidak tersedia, sistem otomatis menampilkan huruf awal username.

---

### Overlay tidak berubah setelah update tampilan

Coba refresh browser:

```txt
CTRL + F5
```

Jika menggunakan OBS:

* Klik kanan Browser Source
* Pilih refresh
* Atau hapus lalu tambahkan ulang Browser Source

---

## Hosting

Project ini menggunakan:

```txt
Express + Socket.IO + TikTok Live Listener
```

Karena sistem harus membaca komentar TikTok Live secara realtime, project ini membutuhkan proses Node.js yang terus berjalan.

Project ini lebih cocok dijalankan di:

* Local PC
* Railway
* Render
* VPS

Project ini kurang cocok jika full di-host di Vercel, karena Vercel tidak cocok untuk proses listener TikTok Live yang harus menyala terus.

---

## Catatan GitHub

Folder `node_modules` sebaiknya tidak diupload ke GitHub.

Buat file:

```bash
.gitignore
```

Isi file `.gitignore`:

```gitignore
node_modules
.env
```

Jika folder `node_modules` sudah terlanjur terupload ke GitHub, sebaiknya hapus dari repository agar project lebih ringan.

---

## Script NPM Opsional

Agar project bisa dijalankan dengan:

```bash
npm start
```

Tambahkan script berikut di `package.json`:

```json
"scripts": {
  "start": "node server.js"
}
```

Lalu jalankan:

```bash
npm start
```

---

## Teknologi yang Digunakan

* Node.js
* Express
* Socket.IO
* tiktok-live-connector
* HTML
* CSS
* JavaScript

---

## Lisensi

Project ini dibuat untuk kebutuhan giveaway TikTok Live pribadi.
