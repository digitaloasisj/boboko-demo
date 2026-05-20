import {
  Anggota,
  AuditLog,
  Distrik,
  Notifikasi,
  Pembayaran,
  Registrasi,
  SyncStatus,
  User,
} from '../types';

export const BIAYA_REGISTRASI = 50000;

export const seedDistrik: Distrik[] = [
  { id: 'd1', kode: 'A', nama: 'Distrik A - Bandung Kota', korwil: 'Asep Sunandar', jumlahAnggota: 0, status: 'aktif' },
  { id: 'd2', kode: 'B', nama: 'Distrik B - Bandung Barat', korwil: 'Budi Hermawan', jumlahAnggota: 0, status: 'aktif' },
  { id: 'd3', kode: 'C', nama: 'Distrik C - Bandung Timur', korwil: 'Cecep Hidayat', jumlahAnggota: 0, status: 'aktif' },
  { id: 'd4', kode: 'D', nama: 'Distrik D - Bandung Selatan', korwil: 'Dadang Suherman', jumlahAnggota: 0, status: 'aktif' },
  { id: 'd5', kode: 'E', nama: 'Distrik E - Cimahi', korwil: 'Endang Saepudin', jumlahAnggota: 0, status: 'aktif' },
];

export const seedUsers: User[] = [
  { id: 'u1', username: 'admin', nama: 'Admin Pusat', role: 'admin_pusat', email: 'admin@boboko.id' },
  { id: 'u2', username: 'distrikA', nama: 'Admin Distrik A', role: 'admin_distrik', distrikId: 'd1' },
  { id: 'u3', username: 'distrikB', nama: 'Admin Distrik B', role: 'admin_distrik', distrikId: 'd2' },
  { id: 'u4', username: 'operator', nama: 'Operator Pusat', role: 'operator' },
  { id: 'u5', username: 'viewer', nama: 'Viewer', role: 'viewer' },
];

const NAMA_DEPAN = [
  'Andi', 'Siti', 'Deden', 'Rina', 'Agus', 'Asep', 'Budi', 'Citra', 'Dewi', 'Eko',
  'Fajar', 'Galih', 'Hadi', 'Indra', 'Joko', 'Kiki', 'Lina', 'Maman', 'Nia', 'Oman',
  'Putri', 'Qori', 'Rian', 'Sari', 'Tono', 'Umar', 'Vina', 'Wawan', 'Yanto', 'Zaki',
];
const NAMA_BELAKANG = [
  'Setiawan', 'Nurhaliza', 'Maulana', 'Kartika', 'Supriatna', 'Hidayat', 'Permana',
  'Hermawan', 'Saepudin', 'Sutisna', 'Rohman', 'Solihin', 'Mulyadi', 'Wibowo', 'Pratama',
];

function pseudoRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateSeedAnggota(): Anggota[] {
  const rnd = pseudoRandom(42);
  const list: Anggota[] = [];
  let urut = 1;
  seedDistrik.forEach((d) => {
    const jumlah = 8 + Math.floor(rnd() * 8);
    for (let i = 0; i < jumlah; i++) {
      const nd = NAMA_DEPAN[Math.floor(rnd() * NAMA_DEPAN.length)];
      const nb = NAMA_BELAKANG[Math.floor(rnd() * NAMA_BELAKANG.length)];
      const tahun = 2024 + Math.floor(rnd() * 2);
      const bulan = 1 + Math.floor(rnd() * 12);
      const tgl = 1 + Math.floor(rnd() * 27);
      const status = rnd() > 0.15 ? 'aktif' : rnd() > 0.5 ? 'nonaktif' : 'pending';
      list.push({
        id: `a_${d.id}_${i}`,
        nomorAnggota: `BP-${d.kode}-${urut.toString().padStart(5, '0')}`,
        nama: `${nd} ${nb}`,
        nik: `327507${Math.floor(rnd() * 9000000000 + 1000000000)}`.slice(0, 16),
        noHp: '0812' + Math.floor(rnd() * 90000000 + 10000000).toString(),
        email: `${nd.toLowerCase()}${urut}@mail.com`,
        alamat: `Jl. Persib No. ${urut}, ${d.nama}`,
        distrikId: d.id,
        tanggalDaftar: `${tahun}-${bulan.toString().padStart(2, '0')}-${tgl
          .toString()
          .padStart(2, '0')}`,
        status,
        catatan: '',
      });
      urut++;
    }
  });
  return list;
}

export function generateSeedRegistrasi(): Registrasi[] {
  return [
    {
      id: 'r1',
      nama: 'Rendi Pratama',
      nik: '3275071234567001',
      noHp: '081234567001',
      email: 'rendi@mail.com',
      alamat: 'Jl. Asia Afrika No. 1',
      distrikId: 'd1',
      status: 'menunggu_verifikasi',
      tanggalDaftar: '2026-05-15',
      pembayaranId: 'p1',
    },
    {
      id: 'r2',
      nama: 'Sinta Dewi',
      nik: '3275071234567002',
      noHp: '081234567002',
      distrikId: 'd2',
      status: 'menunggu_pembayaran',
      tanggalDaftar: '2026-05-18',
    },
    {
      id: 'r3',
      nama: 'Tegar Aulia',
      nik: '3275071234567003',
      noHp: '081234567003',
      distrikId: 'd1',
      status: 'aktif',
      tanggalDaftar: '2026-05-10',
      pembayaranId: 'p2',
      anggotaId: 'a_d1_0',
    },
    {
      id: 'r4',
      nama: 'Umi Kalsum',
      nik: '3275071234567004',
      noHp: '081234567004',
      distrikId: 'd3',
      status: 'ditolak',
      tanggalDaftar: '2026-05-12',
      pembayaranId: 'p3',
      catatan: 'NIK tidak valid',
    },
  ];
}

export function generateSeedPembayaran(): Pembayaran[] {
  return [
    {
      id: 'p1',
      registrasiId: 'r1',
      metode: 'transfer_bank',
      nominal: BIAYA_REGISTRASI,
      status: 'menunggu_verifikasi',
      tanggal: '2026-05-15',
      noReferensi: 'TRX-001234',
    },
    {
      id: 'p2',
      registrasiId: 'r3',
      metode: 'qris',
      nominal: BIAYA_REGISTRASI,
      status: 'berhasil',
      tanggal: '2026-05-10',
      noReferensi: 'QR-998877',
      verifikasiBy: 'admin',
      tanggalVerifikasi: '2026-05-10',
    },
    {
      id: 'p3',
      registrasiId: 'r4',
      metode: 'transfer_bank',
      nominal: BIAYA_REGISTRASI,
      status: 'gagal',
      tanggal: '2026-05-12',
      catatan: 'Bukti transfer tidak sesuai',
    },
  ];
}

export function generateSeedSync(): SyncStatus[] {
  return seedDistrik.map((d, i) => ({
    distrikId: d.id,
    lastSync: `2026-05-21 ${(8 + i).toString().padStart(2, '0')}:30`,
    status: i === 3 ? 'menunggu' : 'berhasil',
    totalData: 0,
  }));
}

export function generateSeedAudit(): AuditLog[] {
  return [
    {
      id: 'l1',
      timestamp: '2026-05-21 10:30',
      userId: 'u1',
      userName: 'Admin Pusat',
      action: 'Sinkronisasi',
      entity: 'distrik',
      entityId: 'd2',
      detail: 'Sinkronisasi Distrik B berhasil',
    },
    {
      id: 'l2',
      timestamp: '2026-05-21 10:25',
      userId: 'u1',
      userName: 'Admin Pusat',
      action: 'Sinkronisasi',
      entity: 'distrik',
      entityId: 'd1',
      detail: 'Sinkronisasi Distrik A berhasil',
    },
    {
      id: 'l3',
      timestamp: '2026-05-21 09:50',
      userId: 'u2',
      userName: 'Admin Distrik A',
      action: 'Import',
      entity: 'anggota',
      entityId: '-',
      detail: 'Import 12 data anggota baru',
    },
    {
      id: 'l4',
      timestamp: '2026-05-21 09:20',
      userId: 'u1',
      userName: 'Admin Pusat',
      action: 'Verifikasi',
      entity: 'pembayaran',
      entityId: 'p2',
      detail: 'Verifikasi pembayaran QRIS BP-A-00001',
    },
  ];
}

export function generateSeedNotifikasi(): Notifikasi[] {
  return [
    {
      id: 'n1',
      judul: 'Sinkronisasi Berhasil',
      pesan: 'Semua distrik telah tersinkronisasi pukul 10:30 WIB.',
      tanggal: '2026-05-21 10:30',
      dibaca: false,
      tipe: 'sukses',
    },
    {
      id: 'n2',
      judul: 'Pembayaran Menunggu Verifikasi',
      pesan: 'Ada 1 pembayaran baru menunggu verifikasi admin pusat.',
      tanggal: '2026-05-20 16:15',
      dibaca: false,
      tipe: 'info',
    },
    {
      id: 'n3',
      judul: 'Pengumuman Korwil',
      pesan: 'Rapat koordinasi korwil pada 25 Mei 2026 pukul 19:00 WIB.',
      tanggal: '2026-05-19 09:00',
      dibaca: true,
      tipe: 'info',
    },
  ];
}
