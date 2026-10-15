export interface StatusCode {
  hex: string
  decimal: number
  comment: string
}

/** Anexo 1: Lista de Código de Status. Manual TfhkaNet v1.4. La librería retorna este valor en decimal. */
export const STATUS_CODES: StatusCode[] = [
  { hex: '0', decimal: 0, comment: 'Estado desconocido.' },
  { hex: '1', decimal: 1, comment: 'En modo prueba y en espera.' },
  { hex: '2', decimal: 2, comment: 'En modo prueba y emisión de documentos fiscales.' },
  { hex: '3', decimal: 3, comment: 'En modo prueba y emisión de documentos no fiscales.' },
  { hex: '4', decimal: 4, comment: 'En modo fiscal y en espera' },
  { hex: '5', decimal: 5, comment: 'En modo fiscal y emisión de documentos fiscales.' },
  { hex: '6', decimal: 6, comment: 'En modo fiscal y emisión de documentos no fiscales.' },
  { hex: '7', decimal: 7, comment: 'En modo fiscal, cercana carga completa de la memoria fiscal y en espera.' },
  { hex: '8', decimal: 8, comment: 'En modo fiscal, cercana carga completa de la memoria fiscal y en emisión de documentos fiscales.' },
  { hex: '9', decimal: 9, comment: 'En modo fiscal, cercana carga completa de la memoria fiscal y en emisión de documentos no fiscales.' },
  { hex: '0A', decimal: 10, comment: 'En modo fiscal, carga completa de la memoria fiscal y en espera.' },
  { hex: '0B', decimal: 11, comment: 'En modo fiscal, carga completa de la memoria fiscal y en emisión de documentos fiscales.' },
  { hex: '0C', decimal: 12, comment: 'En modo fiscal, carga completa de la memoria fiscal y en emisión de documentos no fiscales.' }
]

/** Anexo 2: Lista de Código de Error. Manual TfhkaNet v1.4. La librería retorna este valor en decimal. */
export const ERROR_CODES: StatusCode[] = [
  { hex: '00', decimal: 0, comment: 'No hay error.' },
  { hex: '01', decimal: 1, comment: 'Fin en la entrega de papel.' },
  { hex: '02', decimal: 2, comment: 'Error de índole mecánico en la entrega de papel.' },
  { hex: '03', decimal: 3, comment: 'Fin en la entrega de papel y error mecánico.' },
  { hex: '50', decimal: 80, comment: 'Comando inválido o valor inválido.' },
  { hex: '54', decimal: 84, comment: 'Tasa inválida.' },
  { hex: '58', decimal: 88, comment: 'No hay asignadas directivas' },
  { hex: '5C', decimal: 92, comment: 'Comando inválido.' },
  { hex: '60', decimal: 96, comment: 'Error fiscal.' },
  { hex: '64', decimal: 100, comment: 'Error de la memoria fiscal.' },
  { hex: '6C', decimal: 108, comment: 'Memoria fiscal llena.' },
  { hex: '70', decimal: 112, comment: 'Buffer completo. (debe enviar el comando de reinicio)' },
  { hex: '80', decimal: 128, comment: 'Error en la comunicación.' },
  { hex: '89', decimal: 137, comment: 'No hay respuesta.' },
  { hex: '90', decimal: 144, comment: 'Error LRC.' },
  { hex: '91', decimal: 145, comment: 'Error interno api.' },
  { hex: '99', decimal: 153, comment: 'Error en la apertura del archivo.' }
]

export function lookupStatus(code: number | undefined | null) {
  if (code === undefined || code === null) return null
  return STATUS_CODES.find((c) => c.decimal === code) ?? null
}

export function lookupError(code: number | undefined | null) {
  if (code === undefined || code === null) return null
  return ERROR_CODES.find((c) => c.decimal === code) ?? null
}

export type FiscalKind = 'idle' | 'open-fiscal' | 'open-nf' | 'hung' | 'unknown'

export interface FiscalSnapshot {
  kind: FiscalKind
  label: string
  statusCode: number | null
  errorCode: number | null
}

const OPEN_FISCAL = new Set([2, 5, 8, 11])
const OPEN_NF = new Set([3, 6, 9, 12])
const IDLE = new Set([1, 4, 7, 10])

export function describeFiscalSnapshot(
  statusCode: number | null,
  errorCode: number | null,
  exceptionMessage?: string | null
): FiscalSnapshot {
  if (errorCode === 137) {
    return {
      kind: 'hung',
      label: 'Sin respuesta (137). Cierra y abre el puerto; el emulador debe estar en ON.',
      statusCode,
      errorCode
    }
  }
  if (/in Fiscal Transaction/i.test(exceptionMessage ?? '')) {
    return {
      kind: 'open-fiscal',
      label: 'Factura fiscal abierta: falta pagar, anular (comando 7) o cerrar resto (101).',
      statusCode: statusCode ?? 5,
      errorCode
    }
  }
  if (statusCode != null && OPEN_FISCAL.has(statusCode)) {
    return {
      kind: 'open-fiscal',
      label: 'Factura fiscal abierta (pendiente de pago o cierre).',
      statusCode,
      errorCode
    }
  }
  if (statusCode != null && OPEN_NF.has(statusCode)) {
    return {
      kind: 'open-nf',
      label: 'Documento no fiscal abierto.',
      statusCode,
      errorCode
    }
  }
  if (statusCode != null && IDLE.has(statusCode)) {
    return {
      kind: 'idle',
      label: 'En espera. Lista para facturar o imprimir reporte X.',
      statusCode,
      errorCode
    }
  }
  const annex = lookupStatus(statusCode)
  return {
    kind: 'unknown',
    label: annex?.comment || exceptionMessage || 'Estado desconocido.',
    statusCode,
    errorCode
  }
}
