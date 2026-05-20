import { Registrasi, User, Anggota } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { uuid, generateNomorAnggota } from '../utils';
import { log } from './audit';
import * as distrikSvc from './distrik';

function applyScope(items: Registrasi[], user: User | null): Registrasi[] {
  if (!user) return [];
  if (user.role === 'admin_distrik' && user.distrikId) {
    return items.filter((r) => r.distrikId === user.distrikId);
  }
  return items;
}

export async function list(user: User | null, filter?: {
  status?: Registrasi['status'] | 'all';
  search?: string;
}): Promise<Registrasi[]> {
  let items = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  items = applyScope(items, user);
  if (filter?.status && filter.status !== 'all') {
    items = items.filter((r) => r.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    items = items.filter(
      (r) => r.nama.toLowerCase().includes(q) || r.nik.includes(q) || r.noHp.includes(q),
    );
  }
  return items.sort((a, b) => (a.tanggalDaftar < b.tanggalDaftar ? 1 : -1));
}

export async function getById(id: string): Promise<Registrasi | null> {
  const all = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  return all.find((r) => r.id === id) || null;
}

export async function create(
  data: Omit<Registrasi, 'id' | 'status' | 'tanggalDaftar'>,
  user: User | null,
): Promise<Registrasi> {
  const all = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  const item: Registrasi = {
    ...data,
    id: uuid(),
    status: 'menunggu_pembayaran',
    tanggalDaftar: new Date().toISOString().slice(0, 10),
  };
  await setJson(KEYS.registrasi, [item, ...all]);
  await log(user, 'Buat Registrasi', 'registrasi', item.id, `Daftar ${item.nama}`);
  return item;
}

export async function update(item: Registrasi, user: User | null): Promise<void> {
  const all = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  await setJson(
    KEYS.registrasi,
    all.map((r) => (r.id === item.id ? item : r)),
  );
  await log(user, 'Update Registrasi', 'registrasi', item.id);
}

export async function setStatus(
  id: string,
  status: Registrasi['status'],
  user: User | null,
  catatan?: string,
): Promise<Registrasi | null> {
  const all = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], status, catatan: catatan ?? all[idx].catatan };
  await setJson(KEYS.registrasi, all);
  await log(user, `Status: ${status}`, 'registrasi', id, catatan);
  return all[idx];
}

export async function aktifkanSebagaiAnggota(
  registrasiId: string,
  user: User | null,
): Promise<Anggota | null> {
  const reg = await getById(registrasiId);
  if (!reg) return null;
  const anggotaList = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  const distrik = await distrikSvc.getById(reg.distrikId);
  const urut = anggotaList.filter((a) => a.distrikId === reg.distrikId).length + 1;
  const anggota: Anggota = {
    id: uuid(),
    nomorAnggota: generateNomorAnggota(distrik?.kode || 'X', urut),
    nama: reg.nama,
    nik: reg.nik,
    noHp: reg.noHp,
    email: reg.email,
    alamat: reg.alamat,
    distrikId: reg.distrikId,
    tanggalDaftar: reg.tanggalDaftar,
    status: 'aktif',
    fotoUrl: reg.fotoUrl,
  };
  await setJson(KEYS.anggota, [anggota, ...anggotaList]);

  const regs = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  await setJson(
    KEYS.registrasi,
    regs.map((r) =>
      r.id === registrasiId ? { ...r, status: 'aktif' as const, anggotaId: anggota.id } : r,
    ),
  );
  await log(user, 'Aktivasi Anggota', 'anggota', anggota.id, `Dari registrasi ${reg.id}`);
  return anggota;
}

export async function countBaru(): Promise<number> {
  const all = (await getJson<Registrasi[]>(KEYS.registrasi)) || [];
  return all.filter(
    (r) => r.status !== 'aktif' && r.status !== 'ditolak',
  ).length;
}
