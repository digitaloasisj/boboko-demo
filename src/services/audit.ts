import { AuditLog, User } from '../types';
import { KEYS, getJson, setJson } from './storage';
import { uuid } from '../utils';

export async function list(): Promise<AuditLog[]> {
  return (await getJson<AuditLog[]>(KEYS.audit)) || [];
}

export async function log(
  user: User | null,
  action: string,
  entity: string,
  entityId: string,
  detail?: string,
): Promise<void> {
  const items = await list();
  const now = new Date();
  const ts =
    now.toISOString().slice(0, 10) +
    ' ' +
    now.toTimeString().slice(0, 5);
  const entry: AuditLog = {
    id: uuid(),
    timestamp: ts,
    userId: user?.id || '-',
    userName: user?.nama || 'Sistem',
    action,
    entity,
    entityId,
    detail,
  };
  await setJson(KEYS.audit, [entry, ...items].slice(0, 200));
}
