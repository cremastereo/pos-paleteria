import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { createConnection } from 'node:net'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { app, type BrowserWindow } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ServiceLogSink, readPidFile, writePidFile } from './service-log-sink'

const execFileAsync = promisify(execFile)

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

const PORT_MIN = 5050
const PORT_MAX = 5060
const READY_TIMEOUT_MS = 20_000
const HEALTH_INTERVAL_MS = 5_000
const BACKOFF = [1000, 3000, 10000]

export class FiscalServiceManager {
  readonly logs = new ServiceLogSink()
  readonly logsDir = this.logs.logsDir
  private window: BrowserWindow | null = null
  private child: ChildProcessWithoutNullStreams | null = null
  private state: ServiceState = 'starting'
  private token: string | null = null
  private port: number | null = null
  private pid: number | null = null
  private lastError: string | null = null
  private stopping = false
  private restartCount = 0
  private restartWindowStart = 0
  private healthTimer: NodeJS.Timeout | null = null
  private healthFails = 0
  private stdoutBuf = ''
  private stderrBuf = ''

  setWindow(win: BrowserWindow | null) {
    this.window = win
    this.logs.setWindow(win)
    this.emitState()
  }

  get samplesDir() {
    const exe = this.resolveExe()
    const nextToExe = join(dirname(exe), 'samples')
    if (existsSync(nextToExe)) return nextToExe
    return join(app.isPackaged ? process.resourcesPath : app.getAppPath(), 'fiscal-service', 'samples')
  }

  getInfo(): ServiceInfo {
    return {
      state: this.state,
      baseUrl: this.port ? `http://127.0.0.1:${this.port}` : null,
      token: this.token,
      port: this.port,
      pid: this.pid,
      lastError: this.lastError,
      logsDir: this.logsDir,
      samplesDir: this.samplesDir
    }
  }

  async start() {
    this.stopping = false
    this.setState('starting')
    this.token = randomBytes(16).toString('hex')
    await this.killStalePid()
    const port = await this.findFreePort()
    if (port === null) {
      this.lastError = 'No hay puerto libre entre 5050 y 5060'
      this.setState('failed')
      return
    }
    this.port = port
    const exe = this.resolveExe()
    if (!existsSync(exe)) {
      this.lastError = `No se encontró FiscalService.exe en ${exe}. Ejecuta npm run build:service.`
      this.logs.append('manager', this.lastError)
      this.setState('failed')
      return
    }

    this.logs.append('manager', `spawn ${exe} --port ${port}`)
    this.child = spawn(
      exe,
      ['--port', String(port), '--token', this.token, '--parent-pid', String(process.pid)],
      { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }
    ) as unknown as ChildProcessWithoutNullStreams
    this.pid = this.child.pid ?? null
    if (this.pid) writePidFile(this.pidPath(), this.pid)

    this.child.stdout.on('data', (buf: Buffer) => this.onChunk('stdout', buf))
    this.child.stderr.on('data', (buf: Buffer) => this.onChunk('stderr', buf))
    this.child.on('exit', (code, signal) => this.onExit(code, signal))
    this.child.on('error', (err) => {
      this.lastError = err.message
      this.logs.append('manager', `spawn error: ${err.message}`)
    })

    const ready = await this.waitReady()
    if (!ready) {
      this.lastError = this.lastError ?? 'Timeout de 20s esperando READY'
      this.setState('failed')
      await this.killChild()
      return
    }
    this.restartCount = 0
    this.setState('ready')
    this.startHealthLoop()
  }

  async restart(reason: string) {
    this.logs.append('manager', `restart (${reason})`)
    this.setState('restarting')
    await this.stopInternal()
    await this.start()
  }

  async forceRestart() {
    await this.killChild()
    await this.restart('force')
  }

  async stop() {
    this.stopping = true
    this.setState('stopping')
    await this.stopInternal()
  }

  private async stopInternal() {
    this.stopHealthLoop()
    if (this.child && this.port && this.token) {
      try {
        await fetch(`http://127.0.0.1:${this.port}/shutdown`, {
          method: 'POST',
          headers: { 'X-Tfhka-Token': this.token, 'Content-Type': 'application/json' },
          body: '{}'
        })
      } catch {
        /* ignore */
      }
      const exited = await this.waitExit(3000)
      if (!exited) await this.killChild()
    } else {
      await this.killChild()
    }
    this.child = null
    this.pid = null
  }

  private onChunk(stream: 'stdout' | 'stderr', buf: Buffer) {
    const acc = stream === 'stdout' ? 'stdoutBuf' : 'stderrBuf'
    this[acc] += buf.toString('utf8')
    const parts = this[acc].split(/\r?\n/)
    this[acc] = parts.pop() ?? ''
    for (const line of parts) {
      if (line.length === 0) continue
      this.logs.append(stream, line)
    }
  }

  private async waitReady(): Promise<boolean> {
    const deadline = Date.now() + READY_TIMEOUT_MS
    while (Date.now() < deadline) {
      if (this.child?.exitCode !== null && this.child?.exitCode !== undefined) return false
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/health`)
        if (res.ok) return true
      } catch {
        /* not yet */
      }
      await delay(250)
    }
    return false
  }

  private startHealthLoop() {
    this.stopHealthLoop()
    this.healthFails = 0
    this.healthTimer = setInterval(() => {
      void this.pingHealth()
    }, HEALTH_INTERVAL_MS)
  }

  private stopHealthLoop() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer)
      this.healthTimer = null
    }
  }

  private async pingHealth() {
    if (this.state !== 'ready' && this.state !== 'unresponsive') return
    try {
      const res = await fetch(`http://127.0.0.1:${this.port}/health`)
      if (res.ok) {
        this.healthFails = 0
        if (this.state === 'unresponsive') this.setState('ready')
        return
      }
    } catch {
      /* fail */
    }
    this.healthFails += 1
    if (this.healthFails >= 3) this.setState('unresponsive')
  }

  private onExit(code: number | null, signal: NodeJS.Signals | null) {
    this.logs.append('manager', `exit code=${code} signal=${signal}`)
    this.stopHealthLoop()
    this.child = null
    this.pid = null
    if (this.stopping || this.state === 'stopping') return
    this.lastError = `El servicio terminó (code=${code}, signal=${signal})`
    this.setState('crashed')
    void this.maybeAutoRestart()
  }

  private async maybeAutoRestart() {
    const now = Date.now()
    if (now - this.restartWindowStart > 120_000) {
      this.restartWindowStart = now
      this.restartCount = 0
    }
    if (this.restartCount >= 3) {
      this.lastError = 'Falló el reinicio automático 3 veces en 2 minutos'
      this.setState('failed')
      return
    }
    const wait = BACKOFF[Math.min(this.restartCount, BACKOFF.length - 1)]
    this.restartCount += 1
    this.setState('restarting')
    await delay(wait)
    if (this.stopping) return
    await this.start()
  }

  private resolveExe(): string {
    if (app.isPackaged) {
      return join(process.resourcesPath, 'fiscal-service', 'FiscalService.exe')
    }
    const published = join(app.getAppPath(), 'resources', 'fiscal-service', 'FiscalService.exe')
    if (existsSync(published)) return published
    return join(
      app.getAppPath(),
      'fiscal-service',
      'src',
      'FiscalService',
      'bin',
      'Debug',
      'net8.0-windows',
      'win-x86',
      'publish',
      'FiscalService.exe'
    )
  }

  private pidPath() {
    return join(app.getPath('userData'), 'fiscal-service.pid')
  }

  private async killStalePid() {
    const old = readPidFile(this.pidPath())
    if (!old) return
    try {
      process.kill(old, 0)
      this.logs.append('manager', `matando PID viejo ${old}`)
      await this.taskkill(old)
    } catch {
      /* not running */
    }
  }

  private async killChild() {
    const pid = this.child?.pid ?? this.pid
    if (!pid) return
    try {
      this.child?.kill()
    } catch {
      /* ignore */
    }
    await delay(400)
    try {
      process.kill(pid, 0)
      await this.taskkill(pid)
    } catch {
      /* gone */
    }
  }

  private async taskkill(pid: number) {
    try {
      await execFileAsync('taskkill', ['/PID', String(pid), '/T', '/F'])
    } catch {
      /* ignore */
    }
  }

  private async waitExit(ms: number) {
    if (!this.child) return true
    return await new Promise<boolean>((resolve) => {
      const t = setTimeout(() => resolve(false), ms)
      this.child?.once('exit', () => {
        clearTimeout(t)
        resolve(true)
      })
    })
  }

  private async findFreePort(): Promise<number | null> {
    for (let p = PORT_MIN; p <= PORT_MAX; p++) {
      if (await isFree(p)) return p
    }
    return null
  }

  private setState(state: ServiceState) {
    this.state = state
    this.emitState()
  }

  private emitState() {
    this.window?.webContents.send('service:state', this.getInfo())
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function isFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' })
    socket.once('connect', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => resolve(true))
  })
}
