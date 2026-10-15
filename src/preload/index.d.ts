import type { ServiceInfo, LogLine, DbPingResult } from './index'

export interface FiscalApi {
  getServiceInfo: () => Promise<ServiceInfo>
  restart: () => Promise<void>
  forceRestart: () => Promise<void>
  openLogsFolder: () => Promise<string>
  openFileDialog: () => Promise<string | null>
  getSamplesPath: () => Promise<string>
  onServiceState: (cb: (info: ServiceInfo) => void) => () => void
  onServiceLog: (cb: (line: LogLine) => void) => () => void
}

export interface DbApi {
  ping: () => Promise<DbPingResult>
}

declare global {
  interface Window {
    fiscal: FiscalApi
    db: DbApi
  }
}

export {}
