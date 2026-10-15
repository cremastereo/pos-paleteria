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

interface FiscalPrinterContextValue {
  port: string | null
  ports: string[]
  portsLoading: boolean
  serviceReady: boolean
  status: FiscalPrinterStatus
  refreshPorts: () => Promise<void>
  selectPort: (port: string) => void
}

const FiscalPrinterContext = createContext<FiscalPrinterContextValue | null>(null)

export function FiscalPrinterProvider({ children }: { children: ReactNode }) {
  const info = useFiscalService()
  const { ports, loading, refresh } = useSerialPorts(info)
  const [port, setPort] = useState<string | null>(() => loadPort())
  const [status, setStatus] = useState<FiscalPrinterStatus>(() =>
    loadPort() ? 'inactive' : 'unconfigured'
  )
  const openedPort = useRef<string | null>(null)
  const generation = useRef(0)

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
        const result = await probePrinter(baseUrl, token, port, openedPort, stillCurrent)
        if (!stillCurrent() || result === 'unchanged') return
        setStatus(result)
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

  const serviceReady = info?.state === 'ready' && Boolean(info.baseUrl && info.token)
  const value = useMemo<FiscalPrinterContextValue>(
    () => ({
      port,
      ports,
      portsLoading: loading,
      serviceReady,
      status,
      refreshPorts: refresh,
      selectPort
    }),
    [loading, port, ports, refresh, selectPort, serviceReady, status]
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

type ProbeResult = 'active' | 'inactive' | 'unchanged'

async function probePrinter(
  baseUrl: string,
  token: string,
  port: string,
  openedPort: { current: string | null },
  stillCurrent: () => boolean
): Promise<ProbeResult> {
  try {
    if (openedPort.current !== port) {
      const opened = await callSdk(baseUrl, token, '/openFpctrl', { portName: port })
      if (!stillCurrent() || opened.httpStatus === 503) return 'unchanged'
      if (!resultIsTrue(opened)) return 'inactive'
      openedPort.current = port
    }
    const checked = await callSdk(baseUrl, token, '/checkFprinter', {})
    if (!stillCurrent() || checked.httpStatus === 503) return 'unchanged'
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
