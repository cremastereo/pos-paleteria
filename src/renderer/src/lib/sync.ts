import type { SyncApi } from '../../../shared/sync-api'

export function readSyncApi(): SyncApi | null {
  const candidate: unknown = window.sync
  if (typeof candidate !== 'object' || candidate === null) return null
  if (!('getStatus' in candidate) || !('pair' in candidate) || !('pull' in candidate)) return null
  return candidate as SyncApi
}

export function readAuthApi() {
  const candidate: unknown = window.auth
  if (typeof candidate !== 'object' || candidate === null) return null
  if (!('login' in candidate)) return null
  return candidate as NonNullable<Window['auth']>
}
