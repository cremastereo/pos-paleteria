import { formatMoney } from './fiscal-invoice'

export type ReportKind = 'X' | 'Z'

export interface ReportMoneyRow {
  label: string
  base: number
  tax: number
}

export interface ReportGroup {
  title: string
  rows: ReportMoneyRow[]
}

export interface ReportCounter {
  label: string
  value: string
}

export interface FiscalReportView {
  kind: ReportKind
  source: string
  printed: boolean
  counters: ReportCounter[]
  groups: ReportGroup[]
  netTotal: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i--) {
      const item = asRecord(value[i])
      if (item) return item
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function lookup(data: Record<string, unknown>, ...names: string[]): unknown {
  for (const name of names) {
    if (name in data) return data[name]
    const lower = name.toLowerCase()
    for (const key of Object.keys(data)) {
      if (key.toLowerCase() === lower) return data[key]
    }
  }
  return undefined
}

function num(data: Record<string, unknown>, ...names: string[]): number {
  const raw = lookup(data, ...names)
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : 0
}

function text(data: Record<string, unknown>, ...names: string[]): string {
  const raw = lookup(data, ...names)
  if (raw == null || raw === '') return ''
  if (typeof raw === 'string') {
    const iso = Date.parse(raw)
    if (/^\d{4}-\d{2}-\d{2}/.test(raw) && Number.isFinite(iso)) {
      return new Date(iso).toLocaleString('es-VE')
    }
    return raw
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  return String(raw)
}

function moneyRow(label: string, base: number, tax = 0): ReportMoneyRow {
  return { label, base, tax }
}

function groupTotal(group: ReportGroup): number {
  return group.rows.reduce((s, r) => s + r.base + r.tax, 0)
}

function isReportData(data: Record<string, unknown>): boolean {
  return (
    lookup(data, 'GeneralRate1Sale', 'NumberOfLastInvoice', 'NumberOfLastZReport', 'FreeSalesTax') != null
  )
}

function isAcumulados(data: Record<string, unknown>): boolean {
  return lookup(data, 'GeneralRate1', 'FreeTax', 'getGeneralRate1', 'getFreeTax') != null
}

function fromReportData(data: Record<string, unknown>): Pick<FiscalReportView, 'counters' | 'groups' | 'netTotal'> {
  const sales: ReportGroup = {
    title: 'Facturas',
    rows: [
      moneyRow('Exento', num(data, 'FreeSalesTax')),
      moneyRow('Tasa general', num(data, 'GeneralRate1Sale'), num(data, 'GeneralRate1Tax')),
      moneyRow('Tasa reducida', num(data, 'ReducedRate2Sale'), num(data, 'ReducedRate2Tax')),
      moneyRow('Tasa adicional', num(data, 'AdditionalRate3Sale'), num(data, 'AdditionalRate3Tax')),
      moneyRow(
        'IGTF',
        num(data, 'IgtfRateSales', 'getIgtfRateSales'),
        num(data, 'IgtfRateTaxSales', 'getIgtfRateTaxSales')
      )
    ]
  }
  const credit: ReportGroup = {
    title: 'Notas de credito',
    rows: [
      moneyRow('Exento', num(data, 'FreeTaxDevolution')),
      moneyRow('Tasa general', num(data, 'GeneralRateDevolution'), num(data, 'GeneralRateTaxDevolution')),
      moneyRow('Tasa reducida', num(data, 'ReducedRateDevolution'), num(data, 'ReducedRateTaxDevolution')),
      moneyRow('Tasa adicional', num(data, 'AdditionalRateDevolution'), num(data, 'AdditionalRateTaxDevolution')),
      moneyRow(
        'IGTF',
        num(data, 'IgtfRateDevolution', 'getIgtfRateDevolution'),
        num(data, 'IgtfRateTaxDevolution', 'getIgtfRateTaxDevolution')
      )
    ]
  }
  const debit: ReportGroup = {
    title: 'Notas de debito',
    rows: [
      moneyRow('Exento', num(data, 'FreeTaxDebit')),
      moneyRow('Tasa general', num(data, 'GeneralRateDebit'), num(data, 'GeneralRateTaxDebit')),
      moneyRow('Tasa reducida', num(data, 'ReducedRateDebit'), num(data, 'ReducedRateTaxDebit')),
      moneyRow('Tasa adicional', num(data, 'AdditionalRateDebit'), num(data, 'AdditionalRateTaxDebit')),
      moneyRow(
        'IGTF',
        num(data, 'IgtfRateDebit', 'getIgtfRateDebit'),
        num(data, 'IgtfRateTaxDebit', 'getIgtfRateTaxDebit')
      )
    ]
  }
  const counters: ReportCounter[] = [
    { label: 'Ultima factura', value: text(data, 'NumberOfLastInvoice') || '—' },
    { label: 'Ultima nota credito', value: text(data, 'NumberOfLastCreditNote') || '—' },
    { label: 'Ultima nota debito', value: text(data, 'NumberOfLastDebitNote') || '—' },
    { label: 'Ultimo DNF', value: text(data, 'NumberOfLastNonFiscal') || '—' },
    { label: 'Ultimo reporte Z', value: text(data, 'NumberOfLastZReport') || '—' },
    { label: 'Fecha ultima factura', value: text(data, 'LastInvoiceDate') || '—' },
    { label: 'Fecha ultimo Z', value: text(data, 'ZReportDate') || '—' }
  ]
  return {
    counters,
    groups: [sales, credit, debit],
    netTotal: groupTotal(sales) - groupTotal(credit) + groupTotal(debit)
  }
}

function fromAcumulados(data: Record<string, unknown>): Pick<FiscalReportView, 'counters' | 'groups' | 'netTotal'> {
  const group: ReportGroup = {
    title: 'Acumulados',
    rows: [
      moneyRow('Exento', num(data, 'FreeTax', 'getFreeTax')),
      moneyRow('Percibido', num(data, 'PerceivedTax', 'getPerceivedTax')),
      moneyRow('Tasa general', num(data, 'GeneralRate1', 'getGeneralRate1'), num(data, 'GeneralRate1Tax', 'getgeneralRate1Tax')),
      moneyRow('Tasa reducida', num(data, 'ReducedRate2', 'getReducedRate2', 'GeneralRate2'), num(data, 'ReducedRate2Tax', 'getReducedRate2Tax', 'GeneralRate2Tax')),
      moneyRow('Tasa adicional', num(data, 'AdditionalRate3', 'getAdditionalRate3', 'GeneralRate3'), num(data, 'AdditionalRate3Tax', 'getgeneralRate3Tax', 'GeneralRate3Tax')),
      moneyRow('IGTF', num(data, 'IgtfRate', 'getIgtfRate'), num(data, 'IgtfRateTax', 'getIgtfRateTax'))
    ]
  }
  return { counters: [], groups: [group], netTotal: groupTotal(group) }
}

export function buildFiscalReportView(
  kind: ReportKind,
  source: string,
  raw: unknown,
  printed: boolean
): FiscalReportView | null {
  const data = asRecord(raw)
  if (!data) return null
  const parsed = isReportData(data) ? fromReportData(data) : isAcumulados(data) ? fromAcumulados(data) : fromReportData(data)
  return { kind, source, printed, ...parsed }
}

export function groupMoney(group: ReportGroup): string {
  return formatMoney(groupTotal(group))
}
