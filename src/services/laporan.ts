import { Anggota, DashboardStats, Pembayaran, User } from '../types';
import { KEYS, getJson } from './storage';
import * as anggotaSvc from './anggota';
import * as distrikSvc from './distrik';
import * as registrasiSvc from './registrasi';
import * as pembayaranSvc from './pembayaran';
import * as syncSvc from './sinkronisasi';
import * as auditSvc from './audit';

export async function dashboard(user: User | null): Promise<DashboardStats> {
  const distrik = await distrikSvc.list();
  const allAnggota = (await getJson<Anggota[]>(KEYS.anggota)) || [];

  let anggotaScoped = allAnggota;
  if (user?.role === 'admin_distrik' && user.distrikId) {
    anggotaScoped = allAnggota.filter((a) => a.distrikId === user.distrikId);
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const anggotaBaru = anggotaScoped.filter((a) => a.tanggalDaftar.startsWith(thisMonth)).length;

  const registrasi = await registrasiSvc.list(user);
  const registrasiBaru = registrasi.filter(
    (r) => r.status !== 'aktif' && r.status !== 'ditolak',
  ).length;

  const pembayaranAll = await pembayaranSvc.list();
  const allowedRegIds = new Set(registrasi.map((r) => r.id));
  const pembayaranScoped =
    user?.role === 'admin_distrik'
      ? pembayaranAll.filter((p) => allowedRegIds.has(p.registrasiId))
      : pembayaranAll;
  const pembayaranMenunggu = pembayaranScoped.filter((p) => p.status === 'menunggu_verifikasi').length;
  const today = new Date().toISOString().slice(0, 10);
  const pembayaranSuksesHariIni = pembayaranScoped.filter(
    (p) => p.status === 'berhasil' && (p.tanggalVerifikasi === today || p.tanggal === today),
  ).length;

  const ringkasanPerDistrik = distrik.map((d) => ({
    distrikId: d.id,
    namaDistrik: d.nama,
    jumlah: anggotaScoped.filter((a) => a.distrikId === d.id).length,
  }));

  const aktivitasTerakhir = (await auditSvc.list()).slice(0, 8);

  return {
    totalAnggota: anggotaScoped.length,
    totalDistrik: distrik.length,
    anggotaBaruBulanIni: anggotaBaru,
    registrasiBaru,
    pembayaranMenunggu,
    pembayaranSuksesHariIni,
    statusSinkronisasi: await syncSvc.overallStatus(),
    ringkasanPerDistrik,
    aktivitasTerakhir,
  };
}

export interface LaporanRingkas {
  totalAnggota: number;
  anggotaPerStatus: { status: string; jumlah: number }[];
  totalRegistrasi: number;
  registrasiPerStatus: { status: string; jumlah: number }[];
  totalPembayaran: number;
  totalNominalBerhasil: number;
  pembayaranPerStatus: { status: string; jumlah: number }[];
}

export async function ringkas(user: User | null): Promise<LaporanRingkas> {
  const { items: anggota } = await anggotaSvc.list(user, { pageSize: 100000, page: 0 });
  const reg = await registrasiSvc.list(user);
  const bayar = await pembayaranSvc.list();
  const regIds = new Set(reg.map((r) => r.id));
  const bayarScoped =
    user?.role === 'admin_distrik' ? bayar.filter((p) => regIds.has(p.registrasiId)) : bayar;

  const groupBy = <T extends string>(arr: { status: T }[]): { status: string; jumlah: number }[] => {
    const map = new Map<string, number>();
    arr.forEach((x) => map.set(x.status, (map.get(x.status) || 0) + 1));
    return Array.from(map.entries()).map(([status, jumlah]) => ({ status, jumlah }));
  };

  const totalNominalBerhasil = bayarScoped
    .filter((p: Pembayaran) => p.status === 'berhasil')
    .reduce((sum, p) => sum + p.nominal, 0);

  return {
    totalAnggota: anggota.length,
    anggotaPerStatus: groupBy(anggota),
    totalRegistrasi: reg.length,
    registrasiPerStatus: groupBy(reg),
    totalPembayaran: bayarScoped.length,
    totalNominalBerhasil,
    pembayaranPerStatus: groupBy(bayarScoped),
  };
}
