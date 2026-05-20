import { Anggota, User } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { uuid, generateNomorAnggota } from '../utils';
import { log } from './audit';

export interface ListParams {
  search?: string;
  distrikId?: string;
  status?: Anggota['status'] | 'all';
  page?: number;
  pageSize?: number;
}

function applyRoleScope(items: Anggota[], user: User | null): Anggota[] {
  if (!user) return [];
  if (user.role === 'admin_distrik' && user.distrikId) {
    return items.filter((a) => a.distrikId === user.distrikId);
  }
  return items;
}

export async function list(user: User | null, params: ListParams = {}): Promise<{
  items: Anggota[];
  total: number;
}> {
  let items = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  items = applyRoleScope(items, user);
  if (params.distrikId && params.distrikId !== 'all') {
    items = items.filter((a) => a.distrikId === params.distrikId);
  }
  if (params.status && params.status !== 'all') {
    items = items.filter((a) => a.status === params.status);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (a) =>
        a.nama.toLowerCase().includes(q) ||
        a.nik.includes(q) ||
        a.noHp.includes(q) ||
        a.nomorAnggota.toLowerCase().includes(q),
    );
  }
  const total = items.length;
  if (params.page !== undefined && params.pageSize) {
    const start = params.page * params.pageSize;
    items = items.slice(start, start + params.pageSize);
  }
  return { items, total };
}

export async function getById(id: string): Promise<Anggota | null> {
  const all = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  return all.find((a) => a.id === id) || null;
}

export async function create(
  data: Omit<Anggota, 'id' | 'nomorAnggota' | 'tanggalDaftar' | 'status'>,
  user: User | null,
): Promise<Anggota> {
  const all = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  const distrikList = await import('./distrik').then((m) => m.list());
  const distrik = distrikList.find((d) => d.id === data.distrikId);
  const urutDistrik = all.filter((a) => a.distrikId === data.distrikId).length + 1;
  const item: Anggota = {
    ...data,
    id: uuid(),
    nomorAnggota: generateNomorAnggota(distrik?.kode || 'X', urutDistrik),
    tanggalDaftar: new Date().toISOString().slice(0, 10),
    status: 'aktif',
  };
  await setJson(KEYS.anggota, [item, ...all]);
  await log(user, 'Tambah Anggota', 'anggota', item.id, `Tambah ${item.nama}`);
  return item;
}

export async function update(item: Anggota, user: User | null): Promise<void> {
  const all = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  await setJson(
    KEYS.anggota,
    all.map((a) => (a.id === item.id ? item : a)),
  );
  await log(user, 'Update Anggota', 'anggota', item.id, `Edit ${item.nama}`);
}

export async function remove(id: string, user: User | null): Promise<void> {
  const all = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  const target = all.find((a) => a.id === id);
  await setJson(
    KEYS.anggota,
    all.filter((a) => a.id !== id),
  );
  await log(user, 'Hapus Anggota', 'anggota', id, `Hapus ${target?.nama || id}`);
}

export async function countByDistrik(): Promise<{ distrikId: string; count: number }[]> {
  const all = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  const map = new Map<string, number>();
  for (const a of all) {
    map.set(a.distrikId, (map.get(a.distrikId) || 0) + 1);
  }
  return Array.from(map.entries()).map(([distrikId, count]) => ({ distrikId, count }));
}
