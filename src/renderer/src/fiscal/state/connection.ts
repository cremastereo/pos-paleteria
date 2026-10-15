export type LedState = 'red' | 'yellow' | 'green' | 'gray'

export interface ConnectionState {
  portName: string
  led: LedState
  lastErrorCode: number | null
  lastErrorDescription: string | null
  autoCheck: boolean
}

export function loadPort(): string | null {
  const port = localStorage.getItem('tfhka.port')?.trim()
  return port ? port : null
}

export function savePort(port: string) {
  localStorage.setItem('tfhka.port', port)
}

export function sortComPorts(ports: string[]): string[] {
  return [...ports].sort((a, b) => {
    const num = (s: string) => {
      const m = /(\d+)$/.exec(s)
      return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER
    }
    const d = num(a) - num(b)
    return d !== 0 ? d : a.localeCompare(b, undefined, { sensitivity: 'base' })
  })
}

export function ledAfterOpen(openOk: boolean, checkOk: boolean | null): LedState {
  if (!openOk) return 'red'
  if (checkOk === false) return 'yellow'
  if (checkOk === true) return 'green'
  return 'yellow'
}
