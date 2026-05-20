import { Notifikasi } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { uuid } from '../utils';

export async function list(): Promise<Notifikasi[]> {
  const items = (await getJson<Notifikasi[]>(KEYS.notifikasi)) || [];
  return items.sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export async function countUnread(): Promise<number> {
  const items = await list();
  return items.filter((n) => !n.dibaca).length;
}

export async function markRead(id: string): Promise<void> {
  const items = await list();
  await setJson(
    KEYS.notifikasi,
    items.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
  );
}

export async function markAllRead(): Promise<void> {
  const items = await list();
  await setJson(
    KEYS.notifikasi,
    items.map((n) => ({ ...n, dibaca: true })),
  );
}

export async function create(n: Omit<Notifikasi, 'id' | 'tanggal' | 'dibaca'>): Promise<Notifikasi> {
  const items = await list();
  const item: Notifikasi = {
    ...n,
    id: uuid(),
    tanggal: new Date().toISOString().slice(0, 16).replace('T', ' '),
    dibaca: false,
  };
  await setJson(KEYS.notifikasi, [item, ...items]);
  return item;
}
