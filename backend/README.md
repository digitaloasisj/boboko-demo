# Boboko Backend

Backend ringan untuk aplikasi mobile Boboko Persib. Tersedia **dua varian**:

| Varian | Lokasi | Hosting | Free Tier (2026) |
|---|---|---|---|
| **Cloudflare Workers + KV** ⭐ | [`cloudflare/`](cloudflare/) | Cloudflare edge, serverless | 100% gratis, tanpa CC, tidak sleep |
| Node.js + Express | file [`server.js`](server.js) | VPS / Fly.io / Glitch / Docker | Bervariasi, lihat tabel di bawah |

Keduanya pakai protokol HTTP yang sama:

```
GET    /health         → status & jumlah kunci
GET    /kv/:key        → ambil value JSON
POST   /kv/:key        → simpan value JSON ({ value: ... })
DELETE /kv/:key        → hapus key
POST   /reset          → wipe semua data
```

Aplikasi mobile tidak peduli varian mana — selama URL bisa dijangkau dan respons sesuai.

---

## Pilihan Hosting Gratis (Update 2026)

| Opsi | Gratis? | CC? | Persisten? | Sleep? | Setup |
|---|---|---|---|---|---|
| **Cloudflare Workers** | ✅ 100k req/hari | ❌ tidak perlu | ✅ via Workers KV | ❌ tidak | ~5 menit |
| **Glitch.com** | ✅ | ❌ | ✅ (disk kecil) | ✅ 5 menit idle | ~2 menit |
| **Fly.io** | $5 credit/bulan | ✅ wajib | ✅ volume 3GB | ❌ | ~10 menit |
| **Koyeb** | ✅ 1 service | ❌ | ✅ | ❌ | ~10 menit |
| **Vercel** | ✅ serverless | ❌ | ❌ (perlu external KV) | ❌ | Butuh adapter |
| ~~Render~~ | ~~❌ free web service~~ | – | – | – | (sudah berbayar) |
| ~~Heroku~~ | ~~❌~~ | – | – | – | (sudah berbayar) |
| ~~Railway~~ | ~~❌~~ | – | – | – | (sudah berbayar) |

**Rekomendasi: Cloudflare Workers** — paling stabil untuk demo jangka panjang,
tidak pernah sleep, tidak perlu kartu kredit.

---

## Opsi 1 — Cloudflare Workers (REKOMENDASI) ⭐

100% gratis, edge global, tidak pernah sleep, tanpa kartu kredit.

```bash
cd backend/cloudflare
npm install
npx wrangler login                              # OAuth via browser
npx wrangler kv:namespace create boboko-kv      # salin id ke wrangler.toml
npx wrangler deploy                             # selesai
```

Output:
```
✨ https://boboko-backend.<account>.workers.dev
```

**Detail lengkap step-by-step**: [`cloudflare/README.md`](cloudflare/README.md).

---

## Opsi 2 — Glitch.com (paling cepat, tapi sleep)

Gratis tanpa CC, namun app sleep setelah ~5 menit idle (wake ~3 detik).

1. Buka [glitch.com](https://glitch.com/) → **New Project** → **Import from GitHub**
2. Tempel URL repo: `https://github.com/digitaloasisj/boboko-demo`
3. Klik **OK**. Glitch akan auto-deploy dari folder root.
4. Karena server ada di `backend/`, edit `package.json` root agar `main` & `scripts.start` ngarah ke `backend/server.js`. Atau import langsung folder `backend/` (gunakan **From Glitch project URL** dengan `?path=backend`).
5. URL publik: `https://<project-name>.glitch.me`

Saran: pakai Cloudflare kalau ingin always-on. Pakai Glitch hanya untuk demo singkat.

---

## Opsi 3 — Fly.io ($5 credit/bulan, butuh kartu kredit)

Free credit $5/bulan cukup untuk 3 VM kecil + 3GB volume — tidak akan tertagih
untuk skala demo. Volume persisten, tidak sleep.

```bash
brew install flyctl                     # atau curl -L https://fly.io/install.sh | sh
fly auth signup                         # CC required (no charge)

cd backend
fly launch --copy-config --name boboko-backend --region sin --no-deploy
fly volumes create boboko_data --size 1 --region sin --yes
fly deploy

fly status                              # ambil URL https://boboko-backend.fly.dev
```

Konfigurasi sudah ada di [`fly.toml`](fly.toml).

---

## Opsi 4 — Koyeb (1 service gratis, tanpa CC)

1. Daftar di [koyeb.com](https://www.koyeb.com/) (sign-in via GitHub).
2. **Create Service** → **GitHub** → pilih repo Anda.
3. **Source directory**: `backend`. Build command: `npm install`. Run command: `node server.js`.
4. Plan: **Free (eco)**. Region: Singapore atau Frankfurt.
5. Deploy → dapat URL `https://<name>-<id>.koyeb.app`.

---

## Opsi 5 — Self-host (VPS / Synology / Docker)

```bash
cd backend
docker build -t boboko-backend .
docker run -d -p 3000:3000 -v boboko-data:/app --name boboko boboko-backend
```

Atau langsung node:
```bash
cd backend
npm install
node server.js
```

Expose lewat reverse proxy (nginx, Caddy, traefik) + domain Anda.

---

## Variabel Lingkungan

Berlaku untuk varian Node Express (`server.js`):

| Variabel    | Default     | Keterangan                                   |
|-------------|-------------|----------------------------------------------|
| `PORT`      | `3000`      | Port server                                  |
| `API_KEY`   | _kosong_    | Jika diisi, klien harus kirim `X-Api-Key`    |
| `DATA_DIR`  | `__dirname` | Lokasi file `db.json`                        |

Untuk Cloudflare Workers, set lewat:
- `wrangler secret put API_KEY` (untuk API_KEY)
- KV namespace binding di `wrangler.toml`

---

## Pakai di Aplikasi

1. Buka app → **Pengaturan → Backend Online**
2. Tempel URL backend (tanpa trailing `/`)
3. **Tes Koneksi** → harus sukses
4. **Simpan & Aktifkan** → login ulang
5. Lakukan di setiap perangkat (Admin Pusat, Distrik, dst)
6. Sekarang semua data tersinkron antar perangkat

## Reset Data Online

Dari aplikasi (Pengaturan → Reset Data Demo) atau:
```bash
curl -X POST https://<backend-url>/reset
```
