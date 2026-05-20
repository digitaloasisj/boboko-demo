# Boboko Persib — Mobile App

Aplikasi mobile hybrid (Android + iOS) untuk manajemen keanggotaan komunitas fans Persib Bandung.
Sistem mengikuti pola: **Pusat sebagai master data** ↔ **Distrik / Korwil sebagai cabang** yang hanya
bisa mengakses data wilayahnya sendiri.

Dibangun dengan **React Native + Expo (SDK 52) + Expo Router + TypeScript**.
Mendukung **dua mode** out-of-the-box:

- **OFFLINE** — data tersimpan di AsyncStorage perangkat (default, tidak perlu server).
- **ONLINE** — data berbagi antar perangkat lewat backend Express ringan
  (di-deploy gratis ke Render / Fly / Glitch). Mode bisa diaktifkan langsung
  dari Pengaturan tanpa rebuild APK.

---

## Fitur

| Modul | Pusat | Distrik | Operator | Viewer |
|---|---|---|---|---|
| Login multi-role | ✅ | ✅ | ✅ | ✅ |
| Dashboard Pusat & Distrik (kartu ringkasan) | ✅ | ✅ | ✅ | ✅ |
| Data Anggota (search, filter, paging) | ✅ | ✅ (wilayahnya) | ✅ | ✅ (read) |
| Tambah / Edit / Hapus Anggota | ✅ | ✅ | ✅ (tambah/edit) | – |
| Data Distrik / Korwil | ✅ | ✅ | ✅ | ✅ |
| Registrasi Anggota (form, foto, draft → aktif) | ✅ | ✅ | ✅ | – |
| Pembayaran (transfer + QRIS, bukti, verifikasi) | ✅ | ✅ | ✅ | ✅ (read) |
| Verifikasi Pembayaran (admin pusat) | ✅ | – | – | – |
| Sinkronisasi Data | ✅ | ✅ | – | – |
| Laporan Ringkas | ✅ | ✅ | ✅ | ✅ |
| Notifikasi Pengumuman | ✅ | ✅ | ✅ | ✅ |
| Pengaturan Akun & Akses | ✅ | ✅ | ✅ | ✅ |
| Audit Log perubahan data | ✅ | ✅ | ✅ | – |

### Status keanggotaan
`aktif · nonaktif · pending`

### Status registrasi
`draft · menunggu_pembayaran · menunggu_verifikasi · diverifikasi · aktif · ditolak`

### Status pembayaran
`belum_bayar · menunggu_verifikasi · berhasil · gagal`

### Metode pembayaran
- Transfer bank (instruksi rekening + input nomor referensi/berita transfer + upload bukti)
- QRIS (mock QR statis + nominal otomatis)

---

## Akun Demo

Saat pertama kali dijalankan, sistem otomatis menyemai data mock (5 distrik, ~50 anggota,
beberapa registrasi & pembayaran, status sinkronisasi, audit log, notifikasi).

| Username | Role |
|---|---|
| `admin` | Admin Pusat |
| `distrikA` | Admin Distrik A |
| `distrikB` | Admin Distrik B |
| `operator` | Operator |
| `viewer` | Read-only Viewer |

**Password apa saja** akan diterima (mode demo).

---

## Stack & Keputusan Teknis

- **Expo SDK 52 + Expo Router 4** (file-based routing, typed routes, deep linking otomatis).
- **TypeScript strict mode**.
- **AsyncStorage** untuk penyimpanan lokal — data persist antara restart.
- **Context API** untuk auth state (tanpa Redux — ringan).
- **`FlatList`** dengan `initialNumToRender`, `windowSize`, dan `removeClippedSubviews` untuk daftar
  besar, bukan `ScrollView` yang me-render semua sekaligus.
- **Tanpa chart library berat** — bar chart distrik di-render manual dengan `View` (cepat, tanpa dependency).
- **Tanpa animasi mahal**. Komponen pakai `Pressable` bawaan + opacity feedback.
- **Service layer terpisah** (`src/services/*`) — implementasi sekarang baca/tulis AsyncStorage,
  tinggal ganti ke `fetch` ke API backend dengan signature yang sama.

---

## Struktur Folder

```
boboko-persib/
├── backend/                            # Express + cors, deploy gratis
│   ├── server.js                       # KV API (/kv/:key, /reset, /health)
│   ├── package.json
│   ├── render.yaml                     # One-click deploy ke Render
│   ├── fly.toml                        # Deploy ke Fly.io
│   ├── Dockerfile                      # Untuk VPS / Docker
│   └── README.md                       # Instruksi deploy
├── app/                                # Expo Router file-based routes
│   ├── _layout.tsx                     # Root: SafeArea + AuthProvider + Stack
│   ├── index.tsx                       # Splash → routes ke login/dashboard
│   ├── (auth)/
│   │   └── login.tsx
│   └── (app)/
│       ├── _layout.tsx                 # Tabs: Dashboard / Anggota / Registrasi / Bayar / Lainnya
│       ├── dashboard.tsx
│       ├── lainnya.tsx                 # Entry ke modul sekunder
│       ├── anggota/
│       │   ├── _layout.tsx             # Stack
│       │   ├── index.tsx               # List + search + filter + pagination
│       │   ├── tambah.tsx
│       │   └── [id].tsx                # Detail + edit + hapus
│       ├── registrasi/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── baru.tsx                # Wizard 2 langkah + upload foto
│       │   └── [id].tsx                # Detail + aksi admin
│       ├── pembayaran/
│       │   ├── _layout.tsx
│       │   ├── index.tsx               # List + verifikasi cepat
│       │   └── [id].tsx                # Transfer/QRIS + bukti + verifikasi
│       ├── distrik/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── sinkronisasi.tsx            # Pusat ↔ Distrik
│       ├── laporan.tsx
│       ├── notifikasi.tsx
│       └── pengaturan.tsx
├── src/
│   ├── components/                     # Card, Button, Input, Select, StatCard, StatusBadge, ...
│   ├── services/                       # auth, anggota, registrasi, pembayaran, distrik,
│   │                                   # sinkronisasi, laporan, notifikasi, audit, storage
│   ├── store/AuthContext.tsx
│   ├── types/index.ts                  # Domain models
│   ├── data/seed.ts                    # Dummy realistic
│   ├── theme/index.ts                  # Warna Persib + spacing + radius
│   └── utils/index.ts                  # Format tanggal/rupiah, mask, debounce, uuid
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

---

## Cara Menjalankan

### 1. Prasyarat
- Node.js 18+ dan npm/yarn
- macOS / Linux / Windows
- **Untuk dijalankan di HP fisik** (cara paling cepat & tidak memberatkan laptop): install
  **Expo Go** dari Play Store / App Store.
- **Untuk emulator**: Android Studio (Android emulator) atau Xcode (iOS simulator, macOS only).

### 2. Install dependency

```bash
cd boboko-persib
npm install
```

### 3. Jalankan dev server

```bash
npm start
```

Lalu pilih salah satu:
- Tekan **`a`** untuk membuka di Android emulator.
- Tekan **`i`** untuk membuka di iOS simulator (macOS).
- Scan QR yang muncul memakai aplikasi **Expo Go** di HP Anda (Android & iOS) — paling ringan,
  laptop hanya jalan bundler.

### 4. Tips agar laptop tidak lemot
- Jangan jalankan emulator + simulator + Expo Go bersamaan.
- Gunakan `npm start` saja, **tanpa flag `--web` / `--tunnel`** kecuali perlu.
- Tutup tab browser preview kalau ada.

---

## Mode Online — Berbagi data antar perangkat

Saat APK terinstall, defaultnya **mode offline**: tiap HP punya datanya sendiri.
Untuk demo client jarak jauh (multi-device), aktifkan **mode online**:

### Skenario A — Client tinggal install APK, lalu konfigurasi backend di app

1. Deploy backend Anda terlebih dulu (lihat **[backend/README.md](backend/README.md)** —
   Render gratis, ~3 menit).
2. Salin URL backend, mis. `https://boboko-backend-xxxx.onrender.com`.
3. Build APK seperti biasa (`eas build -p android --profile preview`).
4. Bagikan APK + URL backend ke client.
5. Client install APK → login (`admin` / password apa saja) → **Tab "Lainnya"
   → Pengaturan → Backend Online** → tempel URL → **Tes Koneksi** → **Simpan & Aktifkan**.
6. Login ulang → semua data sekarang tersinkron antar perangkat.

### Skenario B — APK pre-konfigurasi (URL ditanam saat build)

Tanam URL ke APK supaya client tidak perlu setting apa pun:

```bash
EXPO_PUBLIC_API_URL=https://boboko-backend-xxxx.onrender.com \
eas build -p android --profile preview
```

Saat APK pertama kali dibuka, **mode online aktif otomatis**. Client tetap bisa
override URL di Pengaturan kalau mau.

> Catatan keamanan: backend default tidak ber-auth (cocok untuk demo). Untuk
> sedikit proteksi, set env `API_KEY=xxxxx` di hosting Anda, lalu isi field
> "API Key" di app.

### Status indikator

- **Login screen** menampilkan badge "Mode Online" / "Mode Offline".
- **Pengaturan → Backend Online** menampilkan URL aktif & status koneksi.

## Build APK Android (paling singkat, siap pakai)

### Opsi A — EAS Build cloud (paling mudah, tidak perlu Android Studio)

```bash
# satu kali saja
npm install -g eas-cli
eas login                      # login akun Expo (gratis)

# di folder project
eas build:configure            # ikuti prompt (skema sudah ada di eas.json)
eas build -p android --profile preview
```

Setelah selesai, EAS akan memberikan **link APK publik**. Salin link itu dan
**kirim ke client lewat WhatsApp / Email / Telegram** — client tinggal buka link
di HP Android, install, dan langsung jalan.

> APK profil `preview` sudah dikonfigurasi `buildType: apk` (bukan AAB), jadi
> bisa di-sideload tanpa Play Store. Link APK dari EAS aktif selama 30 hari.

#### Sertakan URL backend di APK

```bash
EXPO_PUBLIC_API_URL=https://boboko-backend.onrender.com \
eas build -p android --profile preview
```

### Opsi B — Build APK lokal (perlu Android SDK + Java JDK)

```bash
npm install -g eas-cli
eas build -p android --profile preview --local
```

Hasil `.apk` akan ada di folder kerja setelah build selesai. Membutuhkan Android SDK
+ JDK 17 ter-install.

### Opsi C — Build native via `expo prebuild` + Gradle

Hanya gunakan ini kalau perlu kontrol penuh native:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

Hasil APK ada di `android/app/build/outputs/apk/release/app-release.apk`.

---

## Build iOS

Build iOS hanya bisa dilakukan di macOS atau via EAS cloud.

### Cloud (rekomendasi)

```bash
eas build -p ios --profile preview
```

EAS akan meminta Apple ID + memandu otomatis kredensial.

### Lokal (macOS + Xcode)

```bash
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios --configuration Release
```

Untuk distribusi Ad Hoc / TestFlight perlu Apple Developer Account.

---

## Alur Bisnis

### Alur Registrasi Anggota Baru
1. User isi data registrasi (form 2 langkah, upload foto opsional).
2. Sistem buat record `registrasi` dengan status `menunggu_pembayaran`.
3. Aplikasi mengarahkan ke halaman pembayaran.
4. User pilih metode: Transfer Bank (input no. ref + upload bukti) atau QRIS (scan QR mock).
5. Setelah bukti dikirim, status pembayaran → `menunggu_verifikasi`, status registrasi sama.
6. Admin Pusat membuka halaman pembayaran → klik **Verifikasi**.
7. Sistem:
   - Tandai pembayaran `berhasil`
   - Tandai registrasi `aktif`
   - Buat record **Anggota** baru (dengan nomor anggota otomatis `BP-{kode_distrik}-{NNNNN}`)
   - Catat di audit log
8. Anggota muncul di Data Anggota (Pusat & Distrik terkait).

### Pembatasan Akses
- **Admin Pusat**: full akses, satu-satunya yang bisa verifikasi pembayaran.
- **Admin Distrik**: lihat & kelola hanya data distriknya, bisa sync.
- **Operator**: tambah/edit anggota & registrasi (semua distrik), tidak bisa verifikasi/hapus/sync.
- **Viewer**: read-only.

Cek implementasinya di `src/services/auth.ts` (matriks `PERMISSIONS`) & hook `useAuth().can(...)`.

---

## Performa

- Daftar besar pakai `FlatList` virtual: `initialNumToRender=10`, `windowSize=7`,
  `removeClippedSubviews=true`.
- Pagination 20 item/load, di-load saat scroll dekat ujung (`onEndReached`).
- Search di-debounce 300ms.
- Tidak ada chart library — bar chart dashboard dibuat manual dengan `View` (cepat).
- Tidak ada animasi mahal di transisi tab.
- Image picker memakai `quality: 0.5` agar foto kecil.
- Mock data di-seed sekali (`storage.ts`) → tidak di-regenerasi setiap render.

---

## Arsitektur Storage

```
service domain (anggota.ts, registrasi.ts, ...)
        │
        ▼  getJson<T>(key) / setJson<T>(key, value)
        │
        ▼  storage.ts  ←  cek getApiUrl()
        │
   ┌────┴────┐
   │         │
offline    online
   │         │
AsyncStorage   HTTP /kv/:key  →  backend Express
```

Service domain (anggota/registrasi/pembayaran/…) **tidak tahu** mode offline/online.
Mereka hanya panggil `getJson/setJson` di [storage.ts](src/services/storage.ts).
Storage layer otomatis route ke AsyncStorage atau ke backend HTTP.

Untuk migrasi ke backend custom yang lebih kaya (PostgreSQL, auth JWT, dst),
cukup ganti implementasi `getJson/setJson/initializeData` di `storage.ts`,
**tidak perlu menyentuh service atau screen**.

---

## Reset Data Demo

Setelah login → tab **Lainnya → Pengaturan → Reset Data Demo**.
- Mode **offline**: data lokal di-wipe & di-reseed.
- Mode **online**: backend akan menerima `POST /reset`, lalu di-reseed → **mempengaruhi semua perangkat**.

## Troubleshooting

| Masalah | Solusi |
|---|---|
| "Tes Koneksi" gagal di Render free | Container mungkin sedang cold-start. Tunggu 30 detik dan coba lagi. |
| Data hilang setelah Render idle 15 menit | Free tier tanpa persistent disk. Pilih Fly.io atau Render paid. |
| APK install diblokir Android "tidak diketahui" | Aktifkan **Pengaturan → Keamanan → Install dari sumber tidak dikenal**. |
| Mode online tidak muncul setelah simpan URL | Logout dulu, lalu login ulang. App membaca mode saat startup. |
| 401 unauthorized | API_KEY backend tidak cocok dengan field "API Key" di Pengaturan. |

---

## License

MIT — bebas dipakai dan dimodifikasi untuk kebutuhan komunitas Persib.
