import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role } from '../types';
import { KEYS, getJson, setJson } from './storage';

export async function login(username: string, _password: string): Promise<User | null> {
  const users = (await getJson<User[]>(KEYS.users)) || [];
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!user) return null;
  await AsyncStorage.setItem(KEYS.session, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.session);
}

export async function getSession(): Promise<User | null> {
  return getJson<User>(KEYS.session);
}

const PERMISSIONS: Record<Role, string[]> = {
  admin_pusat: ['*'],
  admin_distrik: [
    'read_anggota',
    'write_anggota',
    'delete_anggota',
    'read_registrasi',
    'write_registrasi',
    'read_pembayaran',
    'sync',
    'read_distrik',
    'read_laporan',
  ],
  operator: [
    'read_anggota',
    'write_anggota',
    'read_registrasi',
    'write_registrasi',
    'read_pembayaran',
    'read_distrik',
    'read_laporan',
  ],
  viewer: ['read_anggota', 'read_registrasi', 'read_pembayaran', 'read_distrik', 'read_laporan'],
};

export function can(user: User | null, action: string): boolean {
  if (!user) return false;
  const perms = PERMISSIONS[user.role];
  return perms.includes('*') || perms.includes(action);
}

export function getAllUsers(): Promise<User[]> {
  return getJson<User[]>(KEYS.users).then((u) => u || []);
}

export async function updateUser(user: User): Promise<void> {
  const users = (await getJson<User[]>(KEYS.users)) || [];
  const next = users.map((u) => (u.id === user.id ? user : u));
  await setJson(KEYS.users, next);
}
