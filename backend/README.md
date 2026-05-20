# Boboko Backend

Backend ringan untuk aplikasi mobile Boboko Persib. Single-file Express server
yang menyimpan data JSON ke disk lokal.

```
GET    /health         → status & jumlah kunci
GET    /kv/:key        → ambil value JSON
POST   /kv/:key        → simpan value JSON ({ value: ... })
DELETE /kv/:key        → hapus key
POST   /reset          → wipe semua data
```

## Lokal

```bash
cd backend
npm install
npm start             # default port 3000
```

Tes:
```bash
curl http://localhost:3000/health
```

## Variabel Lingkungan

| Variabel    | Default     | Keterangan                                  |
|-------------|-------------|---------------------------------------------|
| `PORT`      | `3000`      | Port server                                 |
| `API_KEY`   | _kosong_    | Jika diisi, klien harus kirim header `X-Api-Key` |
| `DATA_DIR`  | `__dirname` | Lokasi file `db.json`                       |

## Deploy Gratis

### Opsi 1 — Render (paling mudah, tanpa kartu kredit)

1. Push folder `boboko-persib` ke GitHub.
2. Buka [render.com](https://render.com) → **New +** → **Blueprint**.
3. Pilih repo Anda. Render akan membaca `backend/render.yaml` otomatis.
4. Klik **Apply**. Tunggu ~3 menit.
5. Salin URL service, mis. `https://boboko-backend-xxxx.onrender.com`.
6. Tes: buka URL itu di browser → harus muncul `{"ok":true,"service":"boboko-backend"}`.

> Free tier Render: container di-recycle setelah ~15 menit tanpa traffic. File
> `db.json` lokal akan hilang saat itu, dan aplikasi akan otomatis re-seed
> saat ada akses berikutnya. Cocok untuk demo. Untuk persistensi penuh,
> upgrade ke paid (\$7/mo, dengan disk).

### Opsi 2 — Fly.io (256MB volume persisten gratis)

```bash
brew install flyctl     # atau curl -L https://fly.io/install.sh | sh
fly auth signup         # 1x

cd backend
fly launch --copy-config --name boboko-backend --region sin
fly volumes create boboko_data --size 1 --region sin
fly deploy
fly status              # ambil URL https://boboko-backend.fly.dev
```

Data persisten selamanya (gratis hingga 3 VM kecil + 3GB volume).

### Opsi 3 — Glitch (paling cepat untuk demo singkat)

1. Buka [glitch.com/edit](https://glitch.com/edit) → **New Project** → **Import from GitHub**.
2. Masukkan URL repo.
3. Edit `package.json` agar `main` & `scripts.start` mengarah ke `backend/server.js`.
4. URL publik langsung tersedia: `https://<project-name>.glitch.me`.

### Opsi 4 — Railway / Koyeb / Cyclic

Sama prinsipnya. Deteksi Node.js otomatis. Set root directory ke `backend`,
start command `node server.js`.

### Opsi 5 — Self-host di VPS / Synology / Docker

```bash
cd backend
docker build -t boboko-backend .
docker run -d -p 3000:3000 -v boboko-data:/app --name boboko boboko-backend
```

## Setelah deploy

1. Salin URL backend Anda (tanpa trailing `/`).
2. Buka aplikasi di HP.
3. **Pengaturan → Backend Online** → tempel URL → **Tes Koneksi** → **Simpan & Aktifkan**.
4. Lakukan langkah ini di setiap perangkat (Admin Pusat & semua Distrik).
5. Sekarang semua data tersinkron antar perangkat.

## Reset Data Online

Dari aplikasi (Pengaturan → Reset Data Demo), atau via curl:
```bash
curl -X POST https://your-backend-url/reset
```
