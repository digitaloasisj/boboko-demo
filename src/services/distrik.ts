import { Anggota, Distrik } from '../types';
import { KEYS, getJson, setJson } from './storage';

export async function list(): Promise<Distrik[]> {
  const distrik = (await getJson<Distrik[]>(KEYS.distrik)) || [];
  const anggota = (await getJson<Anggota[]>(KEYS.anggota)) || [];
  return distrik.map((d) => ({
    ...d,
    jumlahAnggota: anggota.filter((a) => a.distrikId === d.id).length,
  }));
}

export async function getById(id: string): Promise<Distrik | null> {
  const all = await list();
  return all.find((d) => d.id === id) || null;
}

export async function save(d: Distrik): Promise<void> {
  const list = (await getJson<Distrik[]>(KEYS.distrik)) || [];
  const exists = list.find((x) => x.id === d.id);
  const next = exists ? list.map((x) => (x.id === d.id ? d : x)) : [...list, d];
  await setJson(KEYS.distrik, next);
}
