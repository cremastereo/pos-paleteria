import type { ServiceInfo, LogLine } from './index'

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

declare global {
  interface Window {
    fiscal: FiscalApi
  }
}

export {}
