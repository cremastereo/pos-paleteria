export type TaxRate = 'exento' | 'general' | 'reducida' | 'adicional'

export type FiscalDocKind = 'factura' | 'credito' | 'debito'

export const TAX_PREFIX: Record<TaxRate, string> = {
  exento: ' ',
  general: '!',
  reducida: '"',
  adicional: '#'
}

const NOTE_TAX_DIGIT: Record<TaxRate, string> = {
  exento: '0',
  general: '1',
  reducida: '2',
  adicional: '3'
}

export const IVA_RATE: Record<TaxRate, number> = {
  exento: 0,
  general: 0.12,
  reducida: 0.08,
  adicional: 0.31
}

export function taxLabel(band: TaxRate, rates: Record<TaxRate, number> = IVA_RATE): string {
  if (band === 'exento') return 'Exento'
  const pct = Math.round(rates[band] * 10000) / 100
  return `IVA ${pct.toLocaleString('es-VE')}%`
}

export function ratesFromS3(s3: Record<string, unknown> | null | undefined): Record<TaxRate, number> {
  const pct = (v: unknown, fallback: number) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0) return fallback
    return n > 1 ? n / 100 : n
  }
  return {
    exento: 0,
    general: pct(s3?.Tax1, IVA_RATE.general),
    reducida: pct(s3?.Tax2, IVA_RATE.reducida),
    adicional: pct(s3?.Tax3, IVA_RATE.adicional)
  }
}

export interface InvoiceItem {
  name: string
  unitPrice: number
  qty: number
  tax: TaxRate
}

export interface InvoicePayment {
  code: string
  amount: number | null
}

export interface AffectedInvoice {
  number: string
  date: string
  serial: string
}

export interface InvoiceCustomer {
  name: string
  rif: string
  comment?: string
  /** Líneas i01–i09 (datos adicionales del cliente, máx. 40 ASCII c/u). */
  extraLines?: string[]
}

export interface BuiltInvoice {
  commands: InvoiceCommand[]
  base: number
  tax: number
  total: number
}

export interface InvoiceCommand {
  cmd: string
  label: string
  role?: 'payment'
  code?: string
  amount?: number | null
}

function padDigits(n: number, width: number): string {
  const rounded = Math.round(n)
  if (rounded < 0) throw new Error('El monto no puede ser negativo')
  const s = String(rounded)
  if (s.length > width) throw new Error(`Valor ${rounded} no cabe en ${width} dígitos`)
  return s.padStart(width, '0')
}

/** El protocolo TFHKA via SendCmd es ASCII 7-bit. Tildes y eñes se rechazan (SendCmd false). */
export function sanitizeFiscalText(text: string, max: number): string {
  const ascii = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, (ch) => (ch === 'Ñ' ? 'N' : 'n'))
    .replace(/ü/gi, (ch) => (ch === 'Ü' ? 'U' : 'u'))
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return ascii.slice(0, max)
}

export function buildItemCmd(item: InvoiceItem, kind: FiscalDocKind = 'factura'): string {
  const priceC = Math.round(item.unitPrice * 100)
  const qtyM = Math.round(item.qty * 1000)
  const name = sanitizeFiscalText(item.name, 40)
  if (!name) throw new Error('El producto no tiene nombre')
  const body = `${padDigits(priceC, 10)}${padDigits(qtyM, 8)}${name}`
  if (kind === 'credito') return `d${NOTE_TAX_DIGIT[item.tax]}${body}`
  if (kind === 'debito') return `\`${NOTE_TAX_DIGIT[item.tax]}${body}`
  return `${TAX_PREFIX[item.tax]}${body}`
}

export function buildPayNameCmd(code: string, name: string): string {
  const nn = code.replace(/\D/g, '').padStart(2, '0').slice(-2)
  return `PE${nn}${sanitizeFiscalText(name, 14)}`
}

export function payCodeDigits(code: string): string {
  return code.replace(/\D/g, '').padStart(2, '0').slice(-2)
}

/** Cierre de resto: comando 1NN, sin monto (demo oficial y VFP HKA). */
export function buildRemainderPayCmd(code: string): string {
  return `1${payCodeDigits(code)}`
}

/**
 * Pago parcial: comando 2NN + 12 dígitos (10 enteros + 2 decimales) con Flag 21 = 00.
 * Manual V8.5: `201000000002062` = medio 01, Bs 20,62.
 * No usar 1NN+monto: en este emulador deja el COM sin ACK (137).
 */
export function buildPartialPayCmd(code: string, amount: number): string {
  return `2${payCodeDigits(code)}${padDigits(Math.round(amount * 100), 12)}`
}

export function buildPaymentCmd(code: string, amount: number | null, amountWidth = 12): string {
  if (amount == null) return buildRemainderPayCmd(code)
  return `1${payCodeDigits(code)}${padDigits(Math.round(amount * 100), amountWidth)}`
}

export function buildExtraLineCmd(index: number, text: string): string | null {
  if (index < 1 || index > 9) return null
  const body = sanitizeFiscalText(text, 40)
  if (!body) return null
  return `i${String(index).padStart(2, '0')}${body}`
}

export function isForeignPayCode(code: string): boolean {
  const n = Number(payCodeDigits(code))
  return n >= 20 && n <= 24
}

export function lineTotals(item: InvoiceItem, rates: Record<TaxRate, number> = IVA_RATE): { base: number; tax: number; total: number } {
  const base = round2(item.unitPrice * item.qty)
  const tax = round2(base * rates[item.tax])
  return { base, tax, total: round2(base + tax) }
}

export function invoiceTotals(items: InvoiceItem[], rates: Record<TaxRate, number> = IVA_RATE): { base: number; tax: number; total: number } {
  return items.reduce(
    (acc, item) => {
      const t = lineTotals(item, rates)
      return { base: round2(acc.base + t.base), tax: round2(acc.tax + t.tax), total: round2(acc.total + t.total) }
    },
    { base: 0, tax: 0, total: 0 }
  )
}

export function padInvoiceNumber(n: string | number): string {
  const digits = String(n).replace(/\D/g, '')
  if (!digits) throw new Error('Indica el numero de factura afectada')
  return digits.padStart(11, '0').slice(-11)
}

export function formatPrinterDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return value.trim()
  const d = value instanceof Date ? value : new Date(String(value ?? ''))
  if (Number.isNaN(d.getTime())) {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${now.getFullYear()}`
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export function buildInvoiceCommands(
  customer: InvoiceCustomer,
  items: InvoiceItem[],
  payments: InvoicePayment[],
  closeCode = '01',
  rates: Record<TaxRate, number> = IVA_RATE,
  kind: FiscalDocKind = 'factura',
  affected?: AffectedInvoice | null
): BuiltInvoice {
  if (items.length === 0) throw new Error('Agrega al menos un producto')
  if (kind !== 'factura') {
    if (!affected?.number?.trim() || !affected.date?.trim() || !affected.serial?.trim()) {
      throw new Error('La nota necesita factura afectada, fecha (DD/MM/AAAA) y serial de la impresora')
    }
  }
  const totals = invoiceTotals(items, rates)
  const commands: InvoiceCommand[] = []

  const rif = sanitizeFiscalText(customer.rif, 40)
  const name = sanitizeFiscalText(customer.name, 40)
  if (rif) commands.push({ cmd: `iR*${rif}`, label: `RIF cliente: ${rif}` })
  if (name) commands.push({ cmd: `iS*${name}`, label: `Razon social: ${name}` })

  const extras = (customer.extraLines ?? []).map((line) => sanitizeFiscalText(line, 40)).filter(Boolean)
  extras.slice(0, 9).forEach((line, i) => {
    const cmd = buildExtraLineCmd(i + 1, line)
    if (cmd) commands.push({ cmd, label: `Adicional i${String(i + 1).padStart(2, '0')}: ${line}` })
  })

  if (kind !== 'factura') {
    const fac = padInvoiceNumber(affected!.number)
    const fecha = sanitizeFiscalText(affected!.date, 14)
    const serial = sanitizeFiscalText(affected!.serial, 14)
    commands.push({ cmd: `iF*${fac}`, label: `Factura afectada: ${fac}` })
    commands.push({ cmd: `iD*${fecha}`, label: `Fecha afectada: ${fecha}` })
    commands.push({ cmd: `iI*${serial}`, label: `Serial: ${serial}` })
  }

  const comment = sanitizeFiscalText(customer.comment ?? '', 40)
  if (comment) {
    const prefix = kind === 'credito' ? 'A' : kind === 'debito' ? 'B' : '@'
    commands.push({ cmd: `${prefix}${comment}`, label: `Comentario: ${comment}` })
  }

  for (const item of items) {
    commands.push({
      cmd: buildItemCmd(item, kind),
      label: `${item.qty} × ${item.name} (${taxLabel(item.tax, rates)})`
    })
  }

  commands.push({ cmd: '3', label: 'Subtotal' })

  const code = payCodeDigits(payments.at(-1)?.code || closeCode)
  commands.push({
    cmd: buildRemainderPayCmd(code),
    label: `Cierre medio ${code} (comando 1${code})`,
    role: 'payment',
    code,
    amount: null
  })

  return { commands, ...totals }
}

export function formatMoney(n: number): string {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
