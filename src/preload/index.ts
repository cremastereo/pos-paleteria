import { contextBridge, ipcRenderer } from 'electron'
import type { AuthApi, LoginResult } from '../shared/auth-api'
import type { SyncApi, SyncPairResult, SyncPullResult, SyncStatusResult } from '../shared/sync-api'
import type { WindowApi } from '../shared/window-api'

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

export interface DbPingResult {
  ok: true
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

const db = {
  ping: (): Promise<DbPingResult> => ipcRenderer.invoke('db:ping')
}

function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args) as Promise<T>
}

const auth: AuthApi = {
  login: (username, password) => invoke<LoginResult>('auth:login', username, password)
}

const sync: SyncApi = {
  getStatus: () => invoke<SyncStatusResult>('sync:getStatus'),
  pair: (pairingCode) => invoke<SyncPairResult>('sync:pair', pairingCode),
  pull: () => invoke<SyncPullResult>('sync:pull')
}

const windowControls: WindowApi = {
  minimize: () => invoke('window:minimize'),
  toggleMaximize: () => invoke<boolean>('window:toggleMaximize'),
  close: () => invoke('window:close'),
  isMaximized: () => invoke<boolean>('window:isMaximized'),
  onMaximizedChange: (listener) => {
    const wrapped = (_event: unknown, maximized: boolean) => listener(maximized)
    ipcRenderer.on('window:maximized', wrapped)
    return () => ipcRenderer.removeListener('window:maximized', wrapped)
  }
}

contextBridge.exposeInMainWorld('fiscal', fiscal)
contextBridge.exposeInMainWorld('db', db)
contextBridge.exposeInMainWorld('sync', sync)
contextBridge.exposeInMainWorld('auth', auth)
contextBridge.exposeInMainWorld('windowControls', windowControls)
