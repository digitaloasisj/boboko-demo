import { SyncStatus, User, Anggota } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { log } from './audit';

export async function list(): Promise<SyncStatus[]> {
  const items = (await getJson<SyncStatus[]>(KEYS.sync)) || [];
  const anggota = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  return items.map((s) => ({
    ...s,
    totalData: anggota.filter((a) => a.distrikId === s.distrikId).length,
  }));
}

function nowStr() {
  const d = new Date();
  return (
    d.toISOString().slice(0, 10) +
    ' ' +
    d.toTimeString().slice(0, 5)
  );
}

export async function syncOne(distrikId: string, user: User | null): Promise<SyncStatus | null> {
  const items = (await getJson<SyncStatus[]>(KEYS.sync)) || [];
  const idx = items.findIndex((s) => s.distrikId === distrikId);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], lastSync: nowStr(), status: 'berhasil' };
  await setJson(KEYS.sync, items);
  await log(user, 'Sinkronisasi', 'distrik', distrikId, 'Sinkronisasi berhasil');
  return items[idx];
}

export async function syncAll(user: User | null): Promise<SyncStatus[]> {
  const items = (await getJson<SyncStatus[]>(KEYS.sync)) || [];
  const updated = items.map((s) => ({ ...s, lastSync: nowStr(), status: 'berhasil' as const }));
  await setJson(KEYS.sync, updated);
  await log(user, 'Sinkronisasi Semua', 'distrik', '-', 'Semua distrik tersinkronisasi');
  return updated;
}

export async function overallStatus(): Promise<'berhasil' | 'sebagian' | 'gagal'> {
  const items = await list();
  if (items.every((s) => s.status === 'berhasil')) return 'berhasil';
  if (items.some((s) => s.status === 'gagal')) return 'gagal';
  return 'sebagian';
}
