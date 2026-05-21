# Boboko Persib — Daftar Fitur & Faktor Effort

Dokumen referensi untuk pembuatan quotation. Mencakup:
1. Fitur yang sudah dibangun (deliverable)
2. Stack teknis & arsitektur
3. Infrastruktur & deployment
4. Faktor pengali effort/biaya
5. Yang TIDAK termasuk (potensi scope tambahan)

---

## 1. RINGKASAN APLIKASI

Aplikasi mobile hybrid untuk manajemen keanggotaan komunitas fans Persib Bandung,
dengan model **Pusat sebagai master data ↔ Distrik/Korwil sebagai cabang** yang
hanya bisa mengakses data wilayahnya sendiri.

**Platform yang di-cover dari satu codebase:**
- ✅ Android (native APK via EAS Build)
- ✅ iOS (via web browser — Safari ready)
- ✅ Web desktop (modern browser)
- 🚧 iOS native APP (siap di-build dengan biaya tambahan Apple Developer Account)

---

## 2. FITUR FUNGSIONAL (MODUL)

### 2.1 Autentikasi & Otorisasi
| Fitur | Status | Catatan |
|---|---|---|
| Login multi-role | ✅ | Username + password |
| Session persistence | ✅ | AsyncStorage / localStorage |
| Logout | ✅ | |
| **4 Role dengan permission matrix berbeda** | ✅ | |
| - Admin Pusat (full access) | ✅ | Bisa verifikasi pembayaran, sync, semua CRUD |
| - Admin Distrik (scoped) | ✅ | Hanya data wilayahnya sendiri |
| - Operator | ✅ | CRUD tanpa verifikasi/hapus |
| - Read-only Viewer | ✅ | Hanya bisa melihat |
| Hak akses scoping di service layer | ✅ | Distrik tidak bisa lihat data distrik lain |
| Permission check di setiap action | ✅ | Via hook `useAuth().can(action)` |

### 2.2 Dashboard
| Fitur | Status |
|---|---|
| Dashboard Pusat (agregat seluruh distrik) | ✅ |
| Dashboard Distrik (scoped wilayah) | ✅ |
| **8 stat cards**: total anggota, anggota baru bulan ini, total distrik, status sync, registrasi baru, bayar menunggu, bayar sukses hari ini | ✅ |
| Bar chart ringkasan anggota per distrik (custom render, no library) | ✅ |
| Aktivitas terakhir (audit log) | ✅ |
| Quick action shortcuts | ✅ |
| Indikator notifikasi belum dibaca (badge counter) | ✅ |

### 2.3 Data Anggota
| Fitur | Status |
|---|---|
| List anggota dengan pagination 20/page | ✅ |
| Virtual list (FlatList) untuk performance | ✅ |
| Search debounced 300ms (nama / NIK / No HP / No Anggota) | ✅ |
| Filter by Distrik (admin pusat only) | ✅ |
| Filter by Status (Aktif / Nonaktif / Pending) | ✅ |
| Detail anggota | ✅ |
| Edit anggota inline | ✅ |
| Hapus anggota (admin pusat) | ✅ |
| Tambah anggota manual | ✅ |
| Mask NIK & No HP di list (privasi) | ✅ |
| Nomor anggota auto-generate `BP-{distrik}-{NNNNN}` | ✅ |
| Audit log untuk setiap perubahan | ✅ |

### 2.4 Data Distrik / Korwil
| Fitur | Status |
|---|---|
| List 5 distrik (Bandung Kota/Barat/Timur/Selatan, Cimahi) | ✅ |
| Detail distrik: nama, korwil, jumlah anggota, status sync | ✅ |
| Navigasi ke list anggota distrik tersebut | ✅ |
| Status sinkronisasi per distrik | ✅ |

### 2.5 Registrasi Anggota Baru
| Fitur | Status |
|---|---|
| Wizard 2-langkah (Data Diri → Konfirmasi) | ✅ |
| Upload foto identitas via image picker | ✅ |
| Pilih distrik / korwil | ✅ |
| Validasi field wajib (nama, NIK, No HP, distrik) | ✅ |
| **6 status registrasi**: draft, menunggu_pembayaran, menunggu_verifikasi, diverifikasi, aktif, ditolak | ✅ |
| Auto-redirect ke halaman pembayaran setelah submit | ✅ |
| List registrasi dengan filter status | ✅ |
| Detail registrasi dengan info pembayaran terkait | ✅ |
| Aksi admin pusat: verifikasi / tolak | ✅ |
| Aktivasi otomatis ke Data Anggota setelah verifikasi | ✅ |
| Riwayat registrasi tersimpan terpisah dari data anggota | ✅ |

### 2.6 Pembayaran Registrasi
| Fitur | Status |
|---|---|
| Tampilkan nominal biaya registrasi (Rp 50.000 hardcoded) | ✅ |
| **2 metode pembayaran:** | |
| - Transfer Bank (BCA mock) dengan instruksi rekening | ✅ |
| - QRIS (QR statis mock — siap diganti dynamic QRIS) | ✅ |
| Input nomor referensi / berita transfer | ✅ |
| Upload bukti transfer/pembayaran (image picker) | ✅ |
| **4 status pembayaran**: belum_bayar, menunggu_verifikasi, berhasil, gagal | ✅ |
| List pembayaran dengan filter status | ✅ |
| Aksi quick-verify dari list (admin pusat) | ✅ |
| Detail pembayaran terhubung ke registrasi | ✅ |
| Notes / catatan saat tolak pembayaran | ✅ |
| Setelah pembayaran berhasil → status anggota otomatis aktif | ✅ |
| Audit trail siapa yang verifikasi & kapan | ✅ |

### 2.7 Sinkronisasi Data
| Fitur | Status |
|---|---|
| List status sinkronisasi per distrik | ✅ |
| Tombol "Sinkronkan Semua" (admin pusat) | ✅ |
| Tombol "Sync" per distrik | ✅ |
| Status: berhasil / menunggu / gagal | ✅ |
| Timestamp sinkronisasi terakhir | ✅ |
| Status overall di dashboard | ✅ |
| Audit log sinkronisasi | ✅ |

### 2.8 Laporan Ringkas
| Fitur | Status |
|---|---|
| Total anggota | ✅ |
| Anggota per status | ✅ |
| Total registrasi & breakdown per status | ✅ |
| Total pembayaran & nominal berhasil | ✅ |
| Pembayaran per status | ✅ |
| Pull-to-refresh untuk update real-time | ✅ |

### 2.9 Notifikasi & Pengumuman
| Fitur | Status |
|---|---|
| List notifikasi (sukses, info, peringatan, error) | ✅ |
| Unread badge counter di dashboard | ✅ |
| Mark single read | ✅ |
| Mark all as read | ✅ |
| Pull-to-refresh | ✅ |

### 2.10 Pengaturan Akun & Akses
| Fitur | Status |
|---|---|
| Profil user view | ✅ |
| Display role + hak akses | ✅ |
| Konfigurasi backend online (URL + API key) | ✅ |
| Test koneksi backend | ✅ |
| Toggle mode offline / online | ✅ |
| Reset data demo | ✅ |
| Logout | ✅ |
| Tentang aplikasi | ✅ |

### 2.11 Audit Log
| Fitur | Status |
|---|---|
| Tracking semua perubahan: tambah/edit/hapus anggota, registrasi, pembayaran, sync | ✅ |
| Timestamp + user + action + entity + detail | ✅ |
| Ditampilkan di dashboard sebagai "Aktivitas Terakhir" | ✅ |
| Otomatis pruning ke 200 entry terakhir | ✅ |

---

## 3. STACK TEKNIS

| Layer | Pilihan | Justifikasi |
|---|---|---|
| Framework | **React Native + Expo SDK 52** | Cross-platform satu codebase |
| Routing | **Expo Router 4** (file-based) | Native + web URL routing |
| Bahasa | **TypeScript strict** | Type safety di seluruh codebase |
| Storage offline | **AsyncStorage** | Native: file storage. Web: localStorage |
| Storage online | **HTTP KV via fetch** | Cloudflare Workers KV |
| Auth | **Context API** (no Redux) | Lebih ringan |
| UI | **Komponen RN bawaan** + custom design system | Tidak pakai UI library berat |
| Icons | **@expo/vector-icons** (Ionicons) | Sudah di-bundle |
| Image picker | **expo-image-picker** | Native gallery + web file input |
| Charts | **Custom View manual** | Tidak pakai chart library (lebih ringan) |
| Animation | **Native Pressable feedback only** | Minimal — performance |

**Total file kode:** 56 file
- 14 screens (Expo Router)
- 11 custom components
- 9 service modules
- 1 context provider
- Theme, types, utils, seed data

---

## 4. ARSITEKTUR STORAGE (DUAL-MODE)

```
Service Layer (anggota, registrasi, pembayaran, ...)
       │
       ▼  getJson<T>(key) / setJson<T>(key, value)
       │
   storage.ts ← cek getApiUrl()
       │
   ┌───┴───┐
   │       │
 offline  online
   │       │
 AsyncStorage   HTTP /kv/:key → Cloudflare Worker
```

**Implikasi efforts:**
- Service domain tidak peduli mode (single contract)
- Tambah backend baru = ganti adapter saja, screen TIDAK perlu diubah
- Migrasi ke PostgreSQL / Firebase nanti tidak rewrite

---

## 5. BACKEND

### Yang sudah dibangun:
- **Cloudflare Workers + KV** (single-file serverless, ~80 baris)
- **Express + Node.js** (alternative, single-file, ~80 baris)
- Endpoints: `GET /kv/:key`, `POST /kv/:key`, `DELETE /kv/:key`, `POST /reset`, `GET /health`
- Optional `X-Api-Key` header authentication
- CORS support
- Auto-seed data saat first call

### Deployment options siap pakai:
- **Cloudflare Workers** (truly free, no CC, no sleep) — REKOMENDASI
- Fly.io ($5 credit/bulan, persistent volume)
- Glitch (free, sleep 5 menit idle)
- Koyeb (free 1 service)
- Self-host via Docker

---

## 6. INFRASTRUKTUR & DEPLOYMENT

### Yang sudah terdeploy:
| Komponen | URL / Status |
|---|---|
| **Source code** | github.com/digitaloasisj/boboko-demo (private repo) |
| **Web App (iOS + desktop)** | https://boboko-demo.pages.dev (Cloudflare Pages) |
| **Backend KV** | https://boboko-backend.boboko.workers.dev (Cloudflare Workers) |
| **APK Android** | EAS Build cloud (link APK aktif 30 hari) |

### Build pipeline:
- **Android APK**: `eas build -p android --profile preview` (10-15 menit)
- **Web**: `bash scripts/deploy-web.sh` (single command — handles font path quirks Cloudflare)
- **Backend**: `wrangler deploy` (~5 detik)
- **CI/CD**: Manual trigger via CLI (siap di-otomatisasi dengan GitHub Actions kalau perlu)

### Biaya hosting saat ini:
| Komponen | Biaya |
|---|---|
| GitHub repo | **Gratis** |
| Cloudflare Pages (web hosting) | **Gratis** (unlimited bandwidth) |
| Cloudflare Workers + KV | **Gratis** (100k req/hari, 1k writes/hari) |
| EAS Build | **Gratis** 30 builds/bulan Android, $19/bulan untuk plan lebih |
| Domain custom (opsional) | Rp 150-500k/tahun (.com / .id) |
| **Total** | **Rp 0 untuk demo, ~Rp 0-500k/tahun untuk production scale demo** |

---

## 7. FAKTOR EFFORT — YANG MEMPENGARUHI BIAYA

### 7.1 Yang membuat effort LEBIH BESAR:

| Faktor | Pengali |
|---|---|
| **Cross-platform** (Android + iOS + web dari satu codebase) | 1.3-1.5x |
| **Multi-role permission matrix** (4 role, scoping data) | +20-30% |
| **Data scoping per distrik** (security boundary di service layer) | +15% |
| **Dual-mode storage** (offline AsyncStorage + online HTTP) | +20% |
| **Custom design system** (vs pakai UI library jadi) | +15-25% |
| **Performance optimization** (virtual list, debounce, manual chart) | +10% |
| **Backend ringan + multi-deployment options** | +1-2 hari |
| **Asset generation pipeline** (icon 4 ukuran, splash) | +0.5 hari |
| **APK build pipeline + signing** (EAS setup) | +1 hari |
| **Web deployment quirks** (Cloudflare @ path, font loading) | +0.5-1 hari |

### 7.2 Yang sudah dihandle (mengurangi risk):

- ✅ Dummy data realistis 50+ anggota
- ✅ Validasi form di setiap input
- ✅ Audit log otomatis untuk semua perubahan
- ✅ Error handling di service layer
- ✅ Loading states di setiap async operation
- ✅ Empty states untuk list kosong
- ✅ Mock QRIS yang siap diganti payment gateway real
- ✅ Responsive layout (mobile-first)
- ✅ Splash + branding asset siap

### 7.3 Estimasi effort (single developer mid-level):

| Modul | Hari kerja |
|---|---|
| Arsitektur + setup project + design system | 2 |
| Auth + RBAC + data scoping | 3 |
| CRUD Anggota + search/filter/pagination | 4 |
| Registrasi flow + foto upload | 3 |
| Pembayaran + QRIS mock + verifikasi | 4 |
| Sinkronisasi pusat ↔ distrik | 2 |
| Dashboard + custom chart | 2 |
| Laporan ringkas | 1 |
| Notifikasi & pengumuman | 1 |
| Pengaturan + backend config UI | 1 |
| Audit log | 0.5 |
| Storage layer dual-mode | 1 |
| Backend (Cloudflare Worker) | 1 |
| Web export + Cloudflare Pages + font fix | 1 |
| Android build pipeline (EAS) | 0.5 |
| Asset generation (icon, splash) | 0.5 |
| Testing + bugfix cross-platform | 3 |
| Dokumentasi (README, deployment guides) | 1 |
| **TOTAL** | **~31 hari (≈ 6-7 minggu)** |

Untuk **tim 2 orang (1 senior + 1 mid)**: 3-4 minggu paralel.

---

## 8. YANG **TIDAK TERMASUK** (POTENSI SCOPE TAMBAHAN)

Item-item berikut belum ada di build saat ini. Kalau client minta, ini akan menambah biaya:

### Backend / Database production-grade:
| Item | Estimasi effort |
|---|---|
| Backend Node.js/Python + PostgreSQL real | 5-10 hari |
| User authentication dengan hash password + JWT | 2-3 hari |
| Email verification | 1-2 hari |
| Password reset flow | 1-2 hari |
| Multi-tenancy (multi-komunitas) | 5-7 hari |
| WebSocket real-time sync | 3-5 hari |
| Database migration & backup pipeline | 2-3 hari |

### Payment gateway nyata:
| Item | Estimasi effort |
|---|---|
| Integrasi Midtrans / Xendit / Doku | 3-5 hari |
| QRIS dinamis dari provider | 2-3 hari |
| Webhook payment confirmation | 2-3 hari |
| Refund flow | 2 hari |
| Recurring payment (iuran bulanan) | 3-5 hari |

### Fitur tambahan umum:
| Item | Estimasi effort |
|---|---|
| Push notifications (FCM) | 2-3 hari |
| Email/SMS notifications (SendGrid/Twilio) | 2-3 hari |
| Export laporan ke PDF | 2-3 hari |
| Export laporan ke Excel | 1-2 hari |
| Print kartu anggota | 2-3 hari |
| Generate barcode/QR untuk kartu anggota | 1 hari |
| Multi-language (i18n) | 2-3 hari |
| Dark mode | 1-2 hari |
| Onboarding tutorial | 1-2 hari |
| In-app feedback / bug report | 1-2 hari |

### Distribusi & store:
| Item | Estimasi effort & biaya |
|---|---|
| Publish ke Google Play Store | 1-2 hari + $25 sekali bayar Google Play Console |
| Publish ke Apple App Store | 2-3 hari + $99/tahun Apple Developer |
| TestFlight beta distribution | 1 hari + Apple Dev account |
| Play Store internal testing | 0.5 hari + Play Console |
| Update OTA via EAS Update | 1 hari setup |
| Custom domain + SSL untuk web | 0.5 hari + Rp 200-500k/tahun domain |

### Analytics & monitoring:
| Item | Estimasi effort |
|---|---|
| Google Analytics / Firebase Analytics | 1 hari |
| Sentry error tracking | 1 hari |
| Performance monitoring (web vitals) | 1 hari |
| User behavior analytics (Mixpanel/Amplitude) | 1-2 hari |

### Admin dashboard web khusus:
| Item | Estimasi effort |
|---|---|
| Web admin dashboard (Next.js/React separate) | 10-15 hari |
| Data export/import bulk | 2-3 hari |
| User management UI lengkap | 3-5 hari |
| Reporting builder (custom date range, export) | 5-7 hari |

### Compliance & security tambahan:
| Item | Estimasi effort |
|---|---|
| PII data encryption at rest | 2-3 hari |
| HTTPS everywhere + HSTS | 0.5 hari |
| Rate limiting di backend | 1 hari |
| Penetration test report | 5-7 hari (3rd party) |
| GDPR / data privacy compliance | 3-5 hari |

---

## 9. RISK & VARIABLE FACTORS

### Yang bisa nambah biaya tak terduga:

1. **Play Protect warning di Android**: kami sudah mitigasi (clean permissions, rename package), tapi GPP tetap mungkin warn untuk APK non-Play Store. Solusi 100%: publish ke Play Store.

2. **iOS support level**: web version di-cover, tapi native iOS APK butuh Apple Developer Account ($99/tahun) + build pipeline tersendiri.

3. **Image storage**: saat ini foto profil / bukti pembayaran disimpan sebagai local URI (per-device). Untuk production multi-device, butuh object storage (S3/R2/Cloudinary) + upload pipeline.

4. **Skala data**: AsyncStorage cocok untuk ribuan record. Untuk 10k+ anggota, perlu real database backend.

5. **Network handling**: offline-first sudah handle, tapi sync conflict resolution untuk simultaneous edit belum (last-write-wins). Untuk team kolaboratif besar, butuh CRDT atau conflict resolution.

6. **Maintenance & support**: belum termasuk SLA, on-call, bug fix paska delivery. Umumnya dihitung terpisah (retainer/quartal).

---

## 10. REKOMENDASI PHASING UNTUK QUOTATION

### Phase 1 — MVP (yang sudah dibangun, ~30 hari)
- Semua fitur di section 2
- Offline mode default
- Demo via APK + web URL
- Backend KV simpel untuk shared demo

### Phase 2 — Production-Ready (+15-20 hari)
- Real backend (PostgreSQL / Firebase)
- User auth proper (JWT, password hash)
- Image upload ke object storage
- Push notifications
- Play Store + App Store publish

### Phase 3 — Enterprise Features (+20-30 hari)
- Payment gateway nyata (Midtrans/Xendit)
- Multi-tenancy
- Real-time sync (WebSocket)
- Admin web dashboard terpisah
- Analytics + monitoring
- Reporting export PDF/Excel

### Phase 4 — Scaling & Ops (ongoing)
- DevOps automation
- Monitoring & alerting
- Customer support tools
- Performance tuning

---

## 11. DELIVERABLE SAAT INI

✅ **Source code lengkap** di GitHub (private repo)
✅ **APK Android siap pakai** (logo Boboko, semua fitur jalan)
✅ **Web app live** (https://boboko-demo.pages.dev — Safari iOS ready)
✅ **Backend deployable** (Cloudflare Workers script siap)
✅ **Dokumentasi**:
   - `README.md` — overview, run instructions, build APK, online mode
   - `backend/README.md` — backend deployment guide
   - `backend/cloudflare/README.md` — Cloudflare Workers step-by-step
   - `QUOTATION.md` — dokumen ini
✅ **Build pipeline**:
   - `eas.json` — EAS Build config Android
   - `scripts/deploy-web.sh` — automated web deploy
   - `backend/render.yaml` + `fly.toml` + `Dockerfile` — backend deploy options

---

## 12. CONTACT & NEGOTIATION NOTES

- Project dapat di-handover dengan walkthrough 2-4 jam
- Source code disertai dokumentasi inline di file kritis
- Service contract terpisah untuk maintenance/feature update
- Penambahan fitur diquote per item dengan estimasi hari kerja
