export interface EnvelopeError {
  kind: string
  type?: string | null
  message: string
  statusError?: Record<string, unknown> | null
  stackTrace?: string | null
}

export interface Envelope {
  ok: boolean
  method: string
  args: unknown
  startedAt: string
  durationMs: number
  result: unknown
  printerStatus: Record<string, unknown> | null
  sdkState: Record<string, unknown> | null
  warnings: string[]
  error: EnvelopeError | null
}

export interface ServiceCall {
  httpStatus: number
  envelope: Envelope | null
  rawText: string
  url: string
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly rawText: string
  ) {
    super(message)
  }
}

export async function callSdk(
  baseUrl: string,
  token: string,
  endpoint: string,
  body: unknown,
  signal?: AbortSignal
): Promise<ServiceCall> {
  const url = `${baseUrl}${endpoint}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 200_000)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tfhka-Token': token
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal
    })
    const rawText = await res.text()
    let envelope: Envelope | null = null
    try {
      envelope = JSON.parse(rawText) as Envelope
    } catch {
      envelope = null
    }
    return { httpStatus: res.status, envelope, rawText, url }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function getJson<T>(baseUrl: string, token: string | null, path: string): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers['X-Tfhka-Token'] = token
  const res = await fetch(`${baseUrl}${path}`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`)
  return (await res.json()) as T
}
