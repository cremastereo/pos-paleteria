import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { PairingForm } from '@/components/settings/pairing-form'
import { readSyncApi } from '@/lib/sync'
import { readStoredSession } from '@/session'
import { type DeviceLinkView, unlinkedStatus } from '../../../shared/sync-api'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<DeviceLinkView | null>(null)

  useEffect(() => {
    let active = true
    const sync = readSyncApi()
    if (!sync) {
      setStatus(unlinkedStatus)
      return
    }
    void sync.getStatus().then((result) => {
      if (active) setStatus(result.status)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!status?.linked || !readStoredSession()) return
    void navigate({ to: '/pos' })
  }, [navigate, status])

  return (
    <main className='flex h-full items-center justify-center p-6'>
      {status === null ? (
        <p className='text-sm text-muted-foreground'>Consultando vinculación…</p>
      ) : status.linked ? (
        <LoginForm />
      ) : (
        <PairingForm onLinked={setStatus} />
      )}
    </main>
  )
}
