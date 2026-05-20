/**
 * Boboko Persib — minimal shared backend.
 *
 * Single-file Node.js + Express server that persists a JSON key/value store
 * to disk. Designed for free-tier hosting (Render, Fly, Glitch, Railway, etc).
 *
 * Endpoints
 *   GET    /                  → { ok, service }
 *   GET    /health            → { ok, keys }
 *   GET    /kv/:key           → { value }
 *   POST   /kv/:key  { value }→ { ok }
 *   DELETE /kv/:key           → { ok }
 *   POST   /reset             → { ok }                  (wipes everything)
 *
 * Optional protection:
 *   Set env var API_KEY → clients must send `X-Api-Key: <key>` header.
 *
 * Storage:
 *   File at DATA_DIR/db.json (DATA_DIR defaults to current dir).
 *   On free tiers without a persistent disk the file lives in /tmp-style
 *   ephemeral storage — data resets when the container is recycled (≈15 min
 *   idle on Render free). The app reseeds automatically so that's OK for demos.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const API_KEY = process.env.API_KEY || null;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_FILE = path.join(DATA_DIR, 'db.json');

let db = {};

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8') || '{}';
      db = JSON.parse(raw);
      console.log('Loaded', Object.keys(db).length, 'keys from', DB_FILE);
    }
  } catch (e) {
    console.error('Failed to load db:', e.message);
    db = {};
  }
}

let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save db:', e.message);
    }
  }, 50);
}

load();

app.use((req, res, next) => {
  if (!API_KEY) return next();
  if (req.method === 'GET' && req.path === '/') return next();
  if (req.method === 'GET' && req.path === '/health') return next();
  const provided = req.headers['x-api-key'];
  if (provided === API_KEY) return next();
  res.status(401).json({ error: 'unauthorized' });
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'boboko-backend', protected: !!API_KEY });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, keys: Object.keys(db).length, uptime: process.uptime() });
});

app.get('/kv/:key', (req, res) => {
  res.json({ value: db[req.params.key] ?? null });
});

app.post('/kv/:key', (req, res) => {
  db[req.params.key] = req.body?.value;
  save();
  res.json({ ok: true });
});

app.delete('/kv/:key', (req, res) => {
  delete db[req.params.key];
  save();
  res.json({ ok: true });
});

app.post('/reset', (_req, res) => {
  db = {};
  save();
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Boboko backend listening on port', port);
  if (API_KEY) console.log('API key protection: ENABLED');
});
