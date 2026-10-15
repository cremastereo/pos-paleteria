import { contextBridge, ipcRenderer } from 'electron'

export type ServiceState =
  | 'starting'
  | 'ready'
  | 'crashed'
  | 'unresponsive'
  | 'restarting'
  | 'failed'
  | 'stopping'

export interface ServiceInfo {
  state: ServiceState
  baseUrl: string | null
  token: string | null
  port: number | null
  pid: number | null
  lastError: string | null
  logsDir: string
  samplesDir: string
}

export interface LogLine {
  ts: string
  stream: 'stdout' | 'stderr' | 'manager'
  text: string
}

const fiscal = {
  getServiceInfo: (): Promise<ServiceInfo> => ipcRenderer.invoke('service:getInfo'),
  restart: (): Promise<void> => ipcRenderer.invoke('service:restart'),
  forceRestart: (): Promise<void> => ipcRenderer.invoke('service:forceRestart'),
  openLogsFolder: (): Promise<string> => ipcRenderer.invoke('logs:openFolder'),
  openFileDialog: (): Promise<string | null> => ipcRenderer.invoke('dialog:openFile'),
  getSamplesPath: (): Promise<string> => ipcRenderer.invoke('samples:path'),
  onServiceState: (cb: (info: ServiceInfo) => void) => {
    const listener = (_: unknown, info: ServiceInfo) => cb(info)
    ipcRenderer.on('service:state', listener)
    return () => ipcRenderer.removeListener('service:state', listener)
  },
  onServiceLog: (cb: (line: LogLine) => void) => {
    const listener = (_: unknown, line: LogLine) => cb(line)
    ipcRenderer.on('service:log', listener)
    return () => ipcRenderer.removeListener('service:log', listener)
  }
}

contextBridge.exposeInMainWorld('fiscal', fiscal)
