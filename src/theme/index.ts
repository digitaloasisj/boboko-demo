export const colors = {
  primary: '#0046AD',
  primaryDark: '#003580',
  primaryLight: '#1E5FBF',
  primarySoft: '#E5EEFA',
  accent: '#00A551',
  accentSoft: '#E1F5EA',
  white: '#FFFFFF',
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#1A2238',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#E5E7EB',
  borderStrong: '#CBD5E1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  successSoft: '#D1FAE5',
  warningSoft: '#FEF3C7',
  errorSoft: '#FEE2E2',
  infoSoft: '#DBEAFE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const shadow = {
  card: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};

export type StatusColorKey =
  | 'aktif'
  | 'nonaktif'
  | 'pending'
  | 'draft'
  | 'menunggu_pembayaran'
  | 'menunggu_verifikasi'
  | 'diverifikasi'
  | 'ditolak'
  | 'belum_bayar'
  | 'berhasil'
  | 'gagal'
  | 'sebagian';

export const statusColor: Record<StatusColorKey, { bg: string; fg: string; label: string }> = {
  aktif: { bg: colors.successSoft, fg: '#047857', label: 'Aktif' },
  nonaktif: { bg: '#E5E7EB', fg: '#374151', label: 'Nonaktif' },
  pending: { bg: colors.warningSoft, fg: '#92400E', label: 'Pending' },
  draft: { bg: '#E5E7EB', fg: '#374151', label: 'Draft' },
  menunggu_pembayaran: { bg: colors.warningSoft, fg: '#92400E', label: 'Menunggu Pembayaran' },
  menunggu_verifikasi: { bg: colors.infoSoft, fg: '#1E40AF', label: 'Menunggu Verifikasi' },
  diverifikasi: { bg: colors.successSoft, fg: '#047857', label: 'Diverifikasi' },
  ditolak: { bg: colors.errorSoft, fg: '#991B1B', label: 'Ditolak' },
  belum_bayar: { bg: '#E5E7EB', fg: '#374151', label: 'Belum Bayar' },
  berhasil: { bg: colors.successSoft, fg: '#047857', label: 'Berhasil' },
  gagal: { bg: colors.errorSoft, fg: '#991B1B', label: 'Gagal' },
  sebagian: { bg: colors.warningSoft, fg: '#92400E', label: 'Sebagian' },
};
