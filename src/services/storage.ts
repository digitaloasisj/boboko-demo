import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateSeedAnggota,
  generateSeedAudit,
  generateSeedNotifikasi,
  generateSeedPembayaran,
  generateSeedRegistrasi,
  generateSeedSync,
  seedDistrik,
  seedUsers,
} from '../data/seed';

const PREFIX = 'boboko_v1_';
const API_URL_KEY = 'boboko_api_url';
const API_KEY_KEY = 'boboko_api_key';

export const KEYS = {
  users: PREFIX + 'users',
  distrik: PREFIX + 'distrik',
  anggota: PREFIX + 'anggota',
  registrasi: PREFIX + 'registrasi',
  pembayaran: PREFIX + 'pembayaran',
  sync: PREFIX + 'sync',
  audit: PREFIX + 'audit',
  notifikasi: PREFIX + 'notifikasi',
  session: PREFIX + 'session',
  seeded: PREFIX + 'seeded',
} as const;

let cachedApiUrl: string | null | undefined = undefined;
let cachedApiKey: string | null | undefined = undefined;

function normalize(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

export async function getApiUrl(): Promise<string | null> {
  if (cachedApiUrl !== undefined) return cachedApiUrl;
  const stored = await AsyncStorage.getItem(API_URL_KEY);
  if (stored) {
    cachedApiUrl = normalize(stored);
  } else {
    const env = (process.env.EXPO_PUBLIC_API_URL as string | undefined) || null;
    cachedApiUrl = normalize(env);
  }
  return cachedApiUrl;
}

export async function getApiKey(): Promise<string | null> {
  if (cachedApiKey !== undefined) return cachedApiKey;
  const stored = await AsyncStorage.getItem(API_KEY_KEY);
  if (stored) {
    cachedApiKey = stored.trim() || null;
  } else {
    cachedApiKey =
      ((process.env.EXPO_PUBLIC_API_KEY as string | undefined) || '').trim() || null;
  }
  return cachedApiKey;
}

export async function setApiUrl(url: string | null): Promise<void> {
  const v = normalize(url);
  if (v) await AsyncStorage.setItem(API_URL_KEY, v);
  else await AsyncStorage.removeItem(API_URL_KEY);
  cachedApiUrl = v;
}

export async function setApiKey(key: string | null): Promise<void> {
  const v = key && key.trim() ? key.trim() : null;
  if (v) await AsyncStorage.setItem(API_KEY_KEY, v);
  else await AsyncStorage.removeItem(API_KEY_KEY);
  cachedApiKey = v;
}

async function authHeaders(): Promise<Record<string, string>> {
  const key = await getApiKey();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers['X-Api-Key'] = key;
  return headers;
}

async function remoteGet<T>(base: string, key: string): Promise<T | null> {
  try {
    const res = await fetch(`${base}/kv/${encodeURIComponent(key)}`, {
      headers: await authHeaders(),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.value ?? null) as T | null;
  } catch (e) {
    console.warn('[storage] remoteGet failed:', (e as Error).message);
    return null;
  }
}

async function remoteSet<T>(base: string, key: string, value: T): Promise<void> {
  try {
    await fetch(`${base}/kv/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ value }),
    });
  } catch (e) {
    console.warn('[storage] remoteSet failed:', (e as Error).message);
  }
}

async function remoteDelete(base: string, key: string): Promise<void> {
  try {
    await fetch(`${base}/kv/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });
  } catch (e) {
    console.warn('[storage] remoteDelete failed:', (e as Error).message);
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const base = await getApiUrl();
  if (base) return remoteGet<T>(base, key);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  const base = await getApiUrl();
  if (base) return remoteSet(base, key, value);
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  const base = await getApiUrl();
  if (base) return remoteDelete(base, key);
  await AsyncStorage.removeItem(key);
}

async function seedAll(write: (k: string, v: any) => Promise<void>) {
  await Promise.all([
    write(KEYS.users, seedUsers),
    write(KEYS.distrik, seedDistrik),
    write(KEYS.anggota, generateSeedAnggota()),
    write(KEYS.registrasi, generateSeedRegistrasi()),
    write(KEYS.pembayaran, generateSeedPembayaran()),
    write(KEYS.sync, generateSeedSync()),
    write(KEYS.audit, generateSeedAudit()),
    write(KEYS.notifikasi, generateSeedNotifikasi()),
  ]);
}

export async function initializeData(): Promise<void> {
  const base = await getApiUrl();
  if (base) {
    const seeded = await remoteGet<string>(base, KEYS.seeded);
    if (seeded === '1') return;
    await seedAll((k, v) => remoteSet(base, k, v));
    await remoteSet(base, KEYS.seeded, '1');
    return;
  }
  const done = await AsyncStorage.getItem(KEYS.seeded);
  if (done === '1') return;
  await seedAll((k, v) => AsyncStorage.setItem(k, JSON.stringify(v)));
  await AsyncStorage.setItem(KEYS.seeded, '1');
}

export async function resetData(): Promise<void> {
  const base = await getApiUrl();
  if (base) {
    try {
      await fetch(`${base}/reset`, { method: 'POST', headers: await authHeaders() });
    } catch (e) {
      console.warn('[storage] remote reset failed:', (e as Error).message);
    }
    await initializeData();
    return;
  }
  await AsyncStorage.multiRemove(Object.values(KEYS));
  await initializeData();
}

export async function testConnection(
  url: string,
  apiKey?: string | null,
): Promise<{ ok: boolean; keys?: number; message?: string }> {
  const base = normalize(url);
  if (!base) return { ok: false, message: 'URL kosong' };
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers['X-Api-Key'] = apiKey;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${base}/health`, { headers, signal: ctrl.signal });
    clearTimeout(t);
    if (res.status === 401) return { ok: false, message: 'API key salah / dibutuhkan' };
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const j = (await res.json()) as { ok?: boolean; keys?: number };
    if (!j?.ok) return { ok: false, message: 'Respons tidak valid' };
    return { ok: true, keys: j.keys };
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'Timeout' : e?.message || 'Gagal terhubung';
    return { ok: false, message: msg };
  }
}

export function getMode(): 'online' | 'offline' {
  return cachedApiUrl ? 'online' : 'offline';
}
