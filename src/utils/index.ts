export function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const bulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${d.getDate().toString().padStart(2, '0')} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalJam(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${formatTanggal(iso)} ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export function formatRupiah(n: number): string {
  if (typeof n !== 'number') return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function maskNik(nik: string): string {
  if (!nik) return '-';
  if (nik.length <= 8) return nik;
  return nik.slice(0, 4) + '*'.repeat(nik.length - 7) + nik.slice(-3);
}

export function maskHp(hp: string): string {
  if (!hp) return '-';
  if (hp.length <= 6) return hp;
  return hp.slice(0, 4) + '****' + hp.slice(-3);
}

export function uuid(): string {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateNomorAnggota(distrikKode: string, urut: number): string {
  return `BP-${distrikKode}-${urut.toString().padStart(5, '0')}`;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'admin_pusat':
      return 'Admin Pusat';
    case 'admin_distrik':
      return 'Admin Distrik';
    case 'operator':
      return 'Operator';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
}
