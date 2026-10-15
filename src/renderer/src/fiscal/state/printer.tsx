import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { callSdk, type ServiceCall } from '@/fiscal/api/client'
import { loadPort, savePort } from '@/fiscal/state/connection'
import { useSerialPorts } from '@/fiscal/state/useSerialPorts'
import type { ServiceInfo } from '../../../../preload/index'

const CHECK_INTERVAL_MS = 30_000

export type FiscalPrinterStatus = 'unconfigured' | 'active' | 'inactive'

export type ReconnectResult = 'active' | 'inactive' | 'unavailable' | 'busy'

interface FiscalPrinterContextValue {
  port: string | null
  ports: string[]
  portsLoading: boolean
  serviceReady: boolean
  status: FiscalPrinterStatus
  reconnecting: boolean
  refreshPorts: () => Promise<void>
  selectPort: (port: string) => void
  reconnectPort: () => Promise<ReconnectResult>
}

const FiscalPrinterContext = createContext<FiscalPrinterContextValue | null>(null)

export function FiscalPrinterProvider({ children }: { children: ReactNode }) {
  const info = useFiscalService()
  const { ports, loading, refresh } = useSerialPorts(info)
  const [port, setPort] = useState<string | null>(() => loadPort())
  const [status, setStatus] = useState<FiscalPrinterStatus>(() =>
    loadPort() ? 'inactive' : 'unconfigured'
  )
  const [reconnecting, setReconnecting] = useState(false)
  const openedPort = useRef<string | null>(null)
  const generation = useRef(0)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const reconnectingTask = useRef<Promise<ReconnectResult> | null>(null)

  const selectPort = useCallback((next: string) => {
    const trimmed = next.trim()
    if (!trimmed) return
    savePort(trimmed)
    openedPort.current = null
    setPort(trimmed)
    setStatus('inactive')
  }, [])

  useEffect(() => {
    if (!port) {
      setStatus('unconfigured')
      return
    }
    if (!info?.baseUrl || !info.token || info.state !== 'ready') {
      setStatus('inactive')
      return
    }

    const baseUrl = info.baseUrl
    const token = info.token
    const current = ++generation.current
    openedPort.current = null
    let running = false
    const stillCurrent = () => generation.current === current

    const tick = async () => {
      if (running || !stillCurrent()) return
      running = true
      try {
        await enqueue(queue, async () => {
          if (!stillCurrent()) return
          const result = await probePrinter(baseUrl, token, port, openedPort, stillCurrent)
          if (!stillCurrent() || result === 'unchanged' || result === 'busy') return
          setStatus(result)
        })
      } finally {
        running = false
      }
    }

    void tick()
    const timer = setInterval(() => void tick(), CHECK_INTERVAL_MS)
    return () => {
      generation.current += 1
      clearInterval(timer)
    }
  }, [info?.baseUrl, info?.state, info?.token, port])

  const reconnectPort = useCallback(() => {
    if (reconnectingTask.current) return reconnectingTask.current
    const baseUrl = info?.baseUrl
    const token = info?.token
    if (!port || !baseUrl || !token || info?.state !== 'ready') {
      return Promise.resolve<ReconnectResult>('unavailable')
    }
    const target = port
    const generationAtStart = generation.current
    const stillCurrent = () => generation.current === generationAtStart
    const task = (async (): Promise<ReconnectResult> => {
      setReconnecting(true)
      try {
        return await enqueue(queue, async () => {
          const result = await probePrinter(baseUrl, token, target, openedPort, stillCurrent, true)
          if (!stillCurrent()) return 'unavailable'
          if (result === 'busy') return 'busy'
          if (result === 'active' || result === 'inactive') {
            setStatus(result)
            return result
          }
          return 'inactive'
        })
      } finally {
        setReconnecting(false)
      }
    })()
    reconnectingTask.current = task
    void task.finally(() => {
      if (reconnectingTask.current === task) reconnectingTask.current = null
    })
    return task
  }, [info?.baseUrl, info?.state, info?.token, port])

  const serviceReady = info?.state === 'ready' && Boolean(info.baseUrl && info.token)
  const value = useMemo<FiscalPrinterContextValue>(
    () => ({
      port,
      ports,
      portsLoading: loading,
      serviceReady,
      status,
      reconnecting,
      refreshPorts: refresh,
      selectPort,
      reconnectPort
    }),
    [loading, port, ports, reconnectPort, reconnecting, refresh, selectPort, serviceReady, status]
  )

  return <FiscalPrinterContext.Provider value={value}>{children}</FiscalPrinterContext.Provider>
}

export function useFiscalPrinter() {
  const value = useContext(FiscalPrinterContext)
  if (!value) throw new Error('useFiscalPrinter debe usarse dentro de FiscalPrinterProvider')
  return value
}

function useFiscalService() {
  const [info, setInfo] = useState<ServiceInfo | null>(null)

  useEffect(() => {
    const candidate: unknown = window.fiscal
    if (typeof candidate !== 'object' || candidate === null) return
    if (!('getServiceInfo' in candidate) || !('onServiceState' in candidate)) return
    const api = candidate as {
      getServiceInfo: () => Promise<ServiceInfo>
      onServiceState: (cb: (info: ServiceInfo) => void) => () => void
    }
    let active = true
    void api.getServiceInfo().then((next) => {
      if (active) setInfo(next)
    })
    const unsubscribe = api.onServiceState((next) => setInfo(next))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return info
}

type ProbeResult = 'active' | 'inactive' | 'unchanged' | 'busy'

function enqueue<T>(queue: { current: Promise<unknown> }, task: () => Promise<T>): Promise<T> {
  const run = queue.current.then(task, task)
  queue.current = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

async function probePrinter(
  baseUrl: string,
  token: string,
  port: string,
  openedPort: { current: string | null },
  stillCurrent: () => boolean,
  closeFirst = false
): Promise<ProbeResult> {
  try {
    if (closeFirst) {
      const closed = await callSdk(baseUrl, token, '/closeFpctrl', {})
      if (!stillCurrent()) return 'unchanged'
      if (closed.httpStatus === 503) return 'busy'
      openedPort.current = null
    }
    if (openedPort.current !== port) {
      const opened = await callSdk(baseUrl, token, '/openFpctrl', { portName: port })
      if (!stillCurrent()) return 'unchanged'
      if (opened.httpStatus === 503) return 'busy'
      if (!resultIsTrue(opened)) return 'inactive'
      openedPort.current = port
    }
    const checked = await callSdk(baseUrl, token, '/checkFprinter', {})
    if (!stillCurrent()) return 'unchanged'
    if (checked.httpStatus === 503) return 'busy'
    const ok = resultIsTrue(checked)
    if (!ok) openedPort.current = null
    return ok ? 'active' : 'inactive'
  } catch {
    if (stillCurrent()) openedPort.current = null
    return 'inactive'
  }
}

function resultIsTrue(call: ServiceCall) {
  return call.envelope?.ok === true && readReturnValue(call.envelope.result)
}

function readReturnValue(result: unknown) {
  if (typeof result !== 'object' || result === null || !('returnValue' in result)) return false
  return result.returnValue === true
}
