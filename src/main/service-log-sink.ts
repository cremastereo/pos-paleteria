import { mkdirSync, appendFileSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'

export interface LogLine {
  ts: string
  stream: 'stdout' | 'stderr' | 'manager'
  text: string
}

export class ServiceLogSink {
  readonly logsDir: string
  private readonly filePath: string
  private readonly buffer: LogLine[] = []
  private readonly max = 2000
  private window: BrowserWindow | null = null

  constructor() {
    this.logsDir = join(app.getPath('userData'), 'logs')
    mkdirSync(this.logsDir, { recursive: true })
    const day = new Date().toISOString().slice(0, 10)
    this.filePath = join(this.logsDir, `fiscal-service-${day}.log`)
  }

  setWindow(win: BrowserWindow | null) {
    this.window = win
  }

  lines() {
    return [...this.buffer]
  }

  append(stream: LogLine['stream'], text: string) {
    const line: LogLine = { ts: new Date().toISOString(), stream, text }
    this.buffer.push(line)
    if (this.buffer.length > this.max) this.buffer.splice(0, this.buffer.length - this.max)
    try {
      appendFileSync(this.filePath, `[${line.ts}] [${stream}] ${text}\n`, 'utf8')
    } catch {
      /* ignore disk errors */
    }
    this.window?.webContents.send('service:log', line)
  }
}

export function readPidFile(path: string): number | null {
  try {
    if (!existsSync(path)) return null
    const n = Number.parseInt(readFileSync(path, 'utf8').trim(), 10)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function writePidFile(path: string, pid: number) {
  writeFileSync(path, String(pid), 'utf8')
}
