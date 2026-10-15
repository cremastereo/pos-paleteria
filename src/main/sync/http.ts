import { z } from 'zod'
import type { SyncErrorCode } from '../../shared/sync-api'
import {
  branchSummarySchema,
  deviceSummarySchema,
  isoDateTimeSchema,
  POS_API_VERSION,
  posApiErrorSchema,
  type PosErrorCode
} from './contracts'

export const API_BASE_URL = 'http://localhost:3000'

const deviceResponseSchema = z.object({
  serverTime: isoDateTimeSchema,
  device: deviceSummarySchema,
  branch: branchSummarySchema
})

export type DeviceResponse = z.infer<typeof deviceResponseSchema>

export type HttpResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: SyncErrorCode; message: string }

interface Parser<T> {
  safeParse: (data: unknown) => { success: true; data: T } | { success: false }
}

const ERROR_MESSAGES: Record<PosErrorCode, string> = {
  UNAUTHORIZED: 'El token no es válido. Vincula de nuevo el dispositivo.',
  DEVICE_REVOKED: 'El dispositivo fue revocado. Vincula de nuevo.',
  BRANCH_INACTIVE: 'La sucursal está inactiva.',
  INVALID_PAIRING_CODE: 'El código de vinculación no es válido o expiró.',
  VALIDATION_ERROR: 'Los datos enviados no cumplen el contrato.',
  INTERNAL: 'Error del servidor. Intenta de nuevo.'
}

function apiUrl(path: string) {
  return `${API_BASE_URL}/api/pos/${POS_API_VERSION}${path}`
}

function readBody(text: string): unknown {
  if (text.trim() === '') return null
  return JSON.parse(text)
}

function failure(code: SyncErrorCode, message: string): HttpResult<never> {
  return { ok: false, code, message }
}

function invalidResponse(): HttpResult<never> {
  return failure('INVALID_RESPONSE', 'La respuesta del servidor no cumple el contrato.')
}

async function requestJson<T>(
  path: string,
  schema: Parser<T>,
  init: { method: 'GET' | 'POST'; token?: string; body?: unknown }
): Promise<HttpResult<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  if (init.token) headers.Authorization = `Bearer ${init.token}`

  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body)
    })
  } catch {
    return failure('NETWORK', 'No hay conexión con el servidor de administración.')
  }

  let payload: unknown
  try {
    payload = readBody(await response.text())
  } catch {
    return invalidResponse()
  }

  if (!response.ok) {
    const parsed = posApiErrorSchema.safeParse(payload)
    if (!parsed.success) return invalidResponse()
    const message = parsed.data.error.message.trim()
    return failure(
      parsed.data.error.code,
      message === '' ? ERROR_MESSAGES[parsed.data.error.code] : message
    )
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) return invalidResponse()
  return { ok: true, data: parsed.data }
}

export function postJson<T>(path: string, body: unknown, schema: Parser<T>, token?: string) {
  return requestJson(path, schema, { method: 'POST', body, token })
}

export function getJson<T>(path: string, schema: Parser<T>, token: string) {
  return requestJson(path, schema, { method: 'GET', token })
}

export function getDevice(token: string) {
  return getJson('/device', deviceResponseSchema, token)
}
