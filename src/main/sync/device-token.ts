import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export class EncryptionUnavailableError extends Error {
  constructor() {
    super('El cifrado del sistema no está disponible para guardar el token.')
    this.name = 'EncryptionUnavailableError'
  }
}

function tokenPath() {
  return join(app.getPath('userData'), 'device-token.bin')
}

export function assertEncryptionAvailable() {
  if (!safeStorage.isEncryptionAvailable()) throw new EncryptionUnavailableError()
}

export function saveDeviceToken(token: string) {
  assertEncryptionAvailable()
  writeFileSync(tokenPath(), safeStorage.encryptString(token))
}

export function loadDeviceToken(): string | null {
  const path = tokenPath()
  if (!existsSync(path)) return null
  if (!safeStorage.isEncryptionAvailable()) throw new EncryptionUnavailableError()
  try {
    return safeStorage.decryptString(readFileSync(path))
  } catch {
    clearDeviceToken()
    return null
  }
}

export function clearDeviceToken() {
  const path = tokenPath()
  if (existsSync(path)) unlinkSync(path)
}
