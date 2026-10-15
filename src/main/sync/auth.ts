import { compareSync } from 'bcryptjs'
import { count, sql } from 'drizzle-orm'
import type { LoginResult } from '../../shared/auth-api'
import { getDatabase } from '../db/client'
import { posUser } from '../db/schema'
import { readDeviceLink } from './store'

export async function login(username: unknown, password: unknown): Promise<LoginResult> {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return { ok: false, message: 'Ingresa usuario y contraseña.' }
  }
  const normalized = username.trim().toLowerCase()
  if (normalized === '' || password === '') {
    return { ok: false, message: 'Ingresa usuario y contraseña.' }
  }

  const link = await readDeviceLink()
  if (!link?.linked || !link.branch) {
    return { ok: false, message: 'Este punto de venta no está vinculado.' }
  }

  const totals = await getDatabase().select({ value: count() }).from(posUser)
  const total = Number(totals[0]?.value ?? 0)
  if (total === 0) {
    return {
      ok: false,
      message: 'No hay usuarios del POS. Actualiza los datos en Ajustes.'
    }
  }

  const rows = await getDatabase()
    .select()
    .from(posUser)
    .where(sql`lower(${posUser.username}) = ${normalized}`)
    .limit(1)
  const user = rows[0]
  const assigned =
    user !== undefined &&
    user.active &&
    Array.isArray(user.branchIds) &&
    user.branchIds.includes(link.branch.id)
  if (!user || !assigned || !passwordMatches(password, user.passwordHash)) {
    return { ok: false, message: 'Usuario o contraseña incorrectos.' }
  }

  return {
    ok: true,
    user: { id: user.id, name: user.name, username: user.username }
  }
}

function passwordMatches(password: string, passwordHash: string) {
  try {
    return compareSync(password, passwordHash)
  } catch {
    return false
  }
}
