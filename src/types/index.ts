export type Role = 'admin_pusat' | 'admin_distrik' | 'operator' | 'viewer';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: Role;
  distrikId?: string;
  email?: string;
}

export interface Distrik {
  id: string;
  kode: string;
  nama: string;
  korwil: string;
  jumlahAnggota: number;
  status: 'aktif' | 'nonaktif';
  alamat?: string;
}

export type StatusAnggota = 'aktif' | 'nonaktif' | 'pending';

export interface Anggota {
  id: string;
  nomorAnggota: string;
  nama: string;
  nik: string;
  noHp: string;
  email?: string;
  alamat?: string;
  distrikId: string;
  tanggalDaftar: string;
  status: StatusAnggota;
  fotoUrl?: string;
  catatan?: string;
}

export type StatusRegistrasi =
  | 'draft'
  | 'menunggu_pembayaran'
  | 'menunggu_verifikasi'
  | 'diverifikasi'
  | 'aktif'
  | 'ditolak';

export interface Registrasi {
  id: string;
  nama: string;
  nik: string;
  noHp: string;
  email?: string;
  alamat?: string;
  distrikId: string;
  status: StatusRegistrasi;
  tanggalDaftar: string;
  fotoUrl?: string;
  catatan?: string;
  pembayaranId?: string;
  anggotaId?: string;
}

export type MetodePembayaran = 'transfer_bank' | 'qris';
export type StatusPembayaran =
  | 'belum_bayar'
  | 'menunggu_verifikasi'
  | 'berhasil'
  | 'gagal';

export interface Pembayaran {
  id: string;
  registrasiId: string;
  metode: MetodePembayaran;
  nominal: number;
  status: StatusPembayaran;
  tanggal: string;
  noReferensi?: string;
  buktiUrl?: string;
  verifikasiBy?: string;
  tanggalVerifikasi?: string;
  catatan?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: string;
}

export interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  tanggal: string;
  dibaca: boolean;
  tipe: 'info' | 'sukses' | 'peringatan' | 'error';
}

export interface SyncStatus {
  distrikId: string;
  lastSync: string;
  status: 'berhasil' | 'gagal' | 'menunggu';
  totalData: number;
}

export interface DashboardStats {
  totalAnggota: number;
  totalDistrik: number;
  anggotaBaruBulanIni: number;
  registrasiBaru: number;
  pembayaranMenunggu: number;
  pembayaranSuksesHariIni: number;
  statusSinkronisasi: 'berhasil' | 'sebagian' | 'gagal';
  ringkasanPerDistrik: { distrikId: string; namaDistrik: string; jumlah: number }[];
  aktivitasTerakhir: AuditLog[];
}
