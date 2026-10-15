import { useCallback, useEffect, useState } from 'react'
import { getJson } from '@/fiscal/api/client'
import { sortComPorts } from '@/fiscal/state/connection'
import type { ServiceInfo } from '../../../../preload/index'

export function useSerialPorts(info: ServiceInfo | null) {
  const [ports, setPorts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!info?.baseUrl || !info.token || info.state !== 'ready') {
      setPorts([])
      return
    }
    setLoading(true)
    try {
      const data = await getJson<{ ports?: unknown }>(info.baseUrl, info.token, '/serialPorts')
      const list = Array.isArray(data.ports) ? data.ports.filter((p): p is string => typeof p === 'string' && p.trim() !== '') : []
      setPorts(sortComPorts(list))
    } catch {
      setPorts([])
    } finally {
      setLoading(false)
    }
  }, [info?.baseUrl, info?.token, info?.state])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { ports, loading, refresh }
}
