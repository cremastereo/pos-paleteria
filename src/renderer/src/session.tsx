import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import type { PosSession } from '../../shared/auth-api'

const STORAGE_KEY = 'pos.session'

interface PosSessionContextValue {
  user: PosSession | null
  setUser: (user: PosSession) => void
  clearUser: () => void
}

const PosSessionContext = createContext<PosSessionContextValue | null>(null)

export function PosSessionProvider({ children }: { children: ReactNode }) {
  const [user, setStoredUser] = useState<PosSession | null>(() => readStoredSession())
  const value = useMemo<PosSessionContextValue>(
    () => ({
      user,
      setUser: (next) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setStoredUser(next)
      },
      clearUser: () => {
        sessionStorage.removeItem(STORAGE_KEY)
        setStoredUser(null)
      }
    }),
    [user]
  )
  return <PosSessionContext.Provider value={value}>{children}</PosSessionContext.Provider>
}

export function usePosSession() {
  const value = useContext(PosSessionContext)
  if (!value) throw new Error('usePosSession debe usarse dentro de PosSessionProvider')
  return value
}

export function readStoredSession(): PosSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isSession(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function isSession(value: unknown): value is PosSession {
  if (typeof value !== 'object' || value === null) return false
  if (!('id' in value) || !('name' in value) || !('username' in value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.username === 'string'
  )
}
