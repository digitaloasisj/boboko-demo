import { Pembayaran, MetodePembayaran, User } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { uuid } from '../utils';
import { log } from './audit';
import { BIAYA_REGISTRASI } from '../data/seed';

export { BIAYA_REGISTRASI };

export async function list(filter?: { status?: Pembayaran['status'] | 'all' }): Promise<Pembayaran[]> {
  let items = (await getJson<Pembayaran[]>(KEYS.pembayaran)) || [];
  if (filter?.status && filter.status !== 'all') {
    items = items.filter((p) => p.status === filter.status);
  }
  return items.sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}

export async function getById(id: string): Promise<Pembayaran | null> {
  const all = await list();
  return all.find((p) => p.id === id) || null;
}

export async function getByRegistrasiId(registrasiId: string): Promise<Pembayaran | null> {
  const all = await list();
  return all.find((p) => p.registrasiId === registrasiId) || null;
}

export async function create(
  registrasiId: string,
  metode: MetodePembayaran,
  user: User | null,
  noReferensi?: string,
  buktiUrl?: string,
): Promise<Pembayaran> {
  const all = (await getJson<Pembayaran[]>(KEYS.pembayaran)) || [];
  const item: Pembayaran = {
    id: uuid(),
    registrasiId,
    metode,
    nominal: BIAYA_REGISTRASI,
    status: noReferensi || buktiUrl ? 'menunggu_verifikasi' : 'belum_bayar',
    tanggal: new Date().toISOString().slice(0, 10),
    noReferensi,
    buktiUrl,
  };
  await setJson(KEYS.pembayaran, [item, ...all]);
  await log(user, 'Buat Pembayaran', 'pembayaran', item.id, `Metode ${metode}`);
  return item;
}

export async function update(item: Pembayaran, user: User | null): Promise<void> {
  const all = (await getJson<Pembayaran[]>(KEYS.pembayaran)) || [];
  await setJson(
    KEYS.pembayaran,
    all.map((p) => (p.id === item.id ? item : p)),
  );
  await log(user, 'Update Pembayaran', 'pembayaran', item.id);
}

export async function verifikasi(
  id: string,
  approved: boolean,
  user: User | null,
  catatan?: string,
): Promise<Pembayaran | null> {
  const all = (await getJson<Pembayaran[]>(KEYS.pembayaran)) || [];
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString().slice(0, 10);
  all[idx] = {
    ...all[idx],
    status: approved ? 'berhasil' : 'gagal',
    verifikasiBy: user?.nama || 'admin',
    tanggalVerifikasi: now,
    catatan: catatan ?? all[idx].catatan,
  };
  await setJson(KEYS.pembayaran, all);
  await log(
    user,
    approved ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran',
    'pembayaran',
    id,
    catatan,
  );
  return all[idx];
}

export async function countMenunggu(): Promise<number> {
  const all = await list({ status: 'menunggu_verifikasi' });
  return all.length;
}

export async function countSuksesHariIni(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const all = await list({ status: 'berhasil' });
  return all.filter((p) => p.tanggalVerifikasi === today || p.tanggal === today).length;
}
