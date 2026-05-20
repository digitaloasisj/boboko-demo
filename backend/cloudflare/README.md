# Backend di Cloudflare Workers (GRATIS, tanpa kartu kredit)

Versi serverless dari backend Boboko Persib, dijalankan di Cloudflare edge
dengan storage Workers KV. **100% gratis** di free tier Cloudflare:

| Kuota                | Free tier                    |
|----------------------|------------------------------|
| Request/hari         | 100.000                      |
| KV reads/hari        | 100.000                      |
| KV writes/hari       | 1.000                        |
| Storage              | 1 GB                         |
| Cold start           | ~0 ms (selalu warm di edge)  |
| Idle timeout         | Tidak ada                    |
| Kartu kredit         | **Tidak diperlukan**         |

Untuk demo komunitas, kuota ini lebih dari cukup.

---

## Setup (sekali saja, ~5 menit)

### 1. Daftar Cloudflare (gratis)

[dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) — cukup email + password, tidak ada billing.

### 2. Install wrangler CLI

```bash
npm install -g wrangler
```

Atau lewat npx (tanpa install global):

```bash
cd backend/cloudflare
npm install
npx wrangler --version
```

### 3. Login

```bash
wrangler login
```

Browser akan terbuka → klik **Allow**. Token tersimpan otomatis di `~/.wrangler/`.

### 4. Buat KV namespace

```bash
cd backend/cloudflare
wrangler kv:namespace create boboko-kv
```

Output:
```
🌀 Creating namespace with title "boboko-backend-boboko-kv"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "KV"
id = "abc123def456..."
```

Salin baris `id = "..."` dan tempel ke [`wrangler.toml`](wrangler.toml) menggantikan
`REPLACE_WITH_YOUR_KV_ID`.

### 5. Deploy

```bash
wrangler deploy
```

Output akan berisi URL Worker Anda:
```
✨ Success!
https://boboko-backend.<your-account>.workers.dev
```

Itu URL backend Anda. Selesai.

### 6. (Opsional) Tambah API Key untuk proteksi

```bash
wrangler secret put API_KEY
# masukkan key acak (mis. hasil `openssl rand -hex 16`)
```

Lalu update `worker.js` agar membaca `env.API_KEY` (sudah default di kode).
Klien (aplikasi) tinggal isi field "API Key" di Pengaturan.

---

## Tes Manual

```bash
URL="https://boboko-backend.<your-account>.workers.dev"

curl $URL/health
# → {"ok":true,"keys":0}

curl -X POST $URL/kv/test \
  -H 'Content-Type: application/json' \
  -d '{"value":"hello"}'
# → {"ok":true}

curl $URL/kv/test
# → {"value":"hello"}
```

---

## Pakai di Aplikasi

1. Buka app → **Pengaturan → Backend Online**
2. Tempel URL Worker Anda
3. **Tes Koneksi** → harus sukses
4. **Simpan & Aktifkan** → login ulang
5. Semua perangkat yang dikonfigurasi URL yang sama akan berbagi data

---

## Update / Re-deploy

```bash
# Edit worker.js → simpan
wrangler deploy
```

Deploy instan (< 5 detik) karena edge.

## Lihat Log Realtime

```bash
wrangler tail
```

## Hapus Semua Data

```bash
curl -X POST $URL/reset
```

Atau dari app: **Pengaturan → Reset Data Demo**.

---

## Kalau preferensi Express server tradisional

Lihat folder induk [`../`](../) untuk versi Node.js Express + Dockerfile +
konfig deploy Fly.io. Cocok kalau Anda butuh persistensi tanpa batas KV write,
atau ingin self-host.
