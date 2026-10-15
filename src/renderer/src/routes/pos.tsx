import { createFileRoute, redirect } from '@tanstack/react-router'
import { readSyncApi } from '@/lib/sync'
import { readStoredSession, usePosSession } from '@/session'

export const Route = createFileRoute('/pos')({
  beforeLoad: async () => {
    if (!readStoredSession()) throw redirect({ to: '/' })
    const sync = readSyncApi()
    if (!sync) throw redirect({ to: '/' })
    const result = await sync.getStatus()
    if (!result.status.linked) throw redirect({ to: '/' })
  },
  component: PosPage
})

function PosPage() {
  const { user } = usePosSession()
  const name = user?.name ?? readStoredSession()?.name ?? ''

  return (
    <main className='flex h-full items-center justify-center p-6'>
      <p className='text-center text-3xl font-medium'>Bienvenido, {name} al POS!</p>
    </main>
  )
}
