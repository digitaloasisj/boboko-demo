/**
 * Boboko Persib — Cloudflare Workers backend.
 *
 * Sama protokolnya dengan backend Express (../server.js), tapi dijalankan
 * di Cloudflare edge dengan storage Workers KV. 100% gratis di free tier
 * Cloudflare (100k req/hari, 1k writes/hari, persistent, global, no sleep).
 *
 * Endpoints:
 *   GET    /                 → { ok, service }
 *   GET    /health           → { ok, keys }
 *   GET    /kv/:key          → { value }
 *   POST   /kv/:key          → { ok }            body: { value: ... }
 *   DELETE /kv/:key          → { ok }
 *   POST   /reset            → { ok }
 *
 * Bindings (set via wrangler.toml):
 *   - KV       : Workers KV namespace
 *   - API_KEY  : (opsional) jika di-set, klien harus kirim X-Api-Key
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
  'Access-Control-Max-Age': '86400',
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...CORS, ...(init.headers || {}) },
  });
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/' && req.method === 'GET') {
      return json({ ok: true, service: 'boboko-backend', runtime: 'cloudflare-workers', protected: !!env.API_KEY });
    }

    if (path === '/health' && req.method === 'GET') {
      const list = await env.KV.list({ limit: 1000 });
      return json({ ok: true, keys: list.keys.length });
    }

    // Auth (skip for / and /health which are above)
    if (env.API_KEY) {
      const provided = req.headers.get('X-Api-Key');
      if (provided !== env.API_KEY) return json({ error: 'unauthorized' }, { status: 401 });
    }

    const kvMatch = path.match(/^\/kv\/(.+)$/);
    if (kvMatch) {
      const key = decodeURIComponent(kvMatch[1]);

      if (req.method === 'GET') {
        const raw = await env.KV.get(key);
        let value = null;
        if (raw != null) {
          try { value = JSON.parse(raw); } catch { value = raw; }
        }
        return json({ value });
      }

      if (req.method === 'POST') {
        let body;
        try { body = await req.json(); } catch { body = {}; }
        await env.KV.put(key, JSON.stringify(body?.value ?? null));
        return json({ ok: true });
      }

      if (req.method === 'DELETE') {
        await env.KV.delete(key);
        return json({ ok: true });
      }
    }

    if (path === '/reset' && req.method === 'POST') {
      let cursor = undefined;
      do {
        const list = await env.KV.list({ cursor, limit: 1000 });
        await Promise.all(list.keys.map((k) => env.KV.delete(k.name)));
        cursor = list.list_complete ? undefined : list.cursor;
      } while (cursor);
      return json({ ok: true });
    }

    return json({ error: 'not found' }, { status: 404 });
  },
};
