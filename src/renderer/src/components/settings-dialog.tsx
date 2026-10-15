import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  unlinkedStatus,
  type DeviceLinkView,
  type DeviceStatus,
  type SyncApi
} from '../../../shared/sync-api'

const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  revoked: 'Revocado'
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.'
}

function readSyncApi(): SyncApi | null {
  const candidate: unknown = window.sync
  if (typeof candidate !== 'object' || candidate === null) return null
  if (!('getStatus' in candidate) || !('pair' in candidate) || !('pull' in candidate)) return null
  return candidate as SyncApi
}

type PendingAction = 'status' | 'pair' | 'pull'

interface Feedback {
  kind: 'error' | 'success'
  message: string
}

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='icon'
        aria-label='Ajustes'
        onClick={() => setOpen(true)}
      >
        <Settings />
      </Button>
      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

function SettingsDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [status, setStatus] = useState<DeviceLinkView | null>(null)
  const [pairingCode, setPairingCode] = useState('')
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!open) return
    let active = true
    setFeedback(null)
    setPending('status')
    const sync = readSyncApi()
    if (!sync) {
      setStatus(unlinkedStatus)
      setFeedback({
        kind: 'error',
        message: 'La vinculación solo está disponible en la aplicación de escritorio.'
      })
      setPending(null)
      return
    }
    void sync
      .getStatus()
      .then((result) => {
        if (!active) return
        setStatus(result.status)
        setFeedback(result.ok ? null : { kind: 'error', message: result.message })
        setPending(null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setStatus(unlinkedStatus)
        setFeedback({ kind: 'error', message: errorMessage(error) })
        setPending(null)
      })
    return () => {
      active = false
    }
  }, [open])

  async function link() {
    setPending('pair')
    setFeedback(null)
    const sync = readSyncApi()
    if (!sync) {
      setFeedback({
        kind: 'error',
        message: 'La vinculación solo está disponible en la aplicación de escritorio.'
      })
      setPending(null)
      return
    }
    try {
      const result = await sync.pair(pairingCode)
      setStatus(result.status)
      if (result.ok) {
        setPairingCode('')
        const branchName = result.status.branch?.name ?? 'la sucursal'
        setFeedback({ kind: 'success', message: `Vinculado a ${branchName}.` })
      } else {
        setFeedback({ kind: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) })
    }
    setPending(null)
  }

  async function updateData() {
    setPending('pull')
    setFeedback(null)
    const sync = readSyncApi()
    if (!sync) {
      setFeedback({
        kind: 'error',
        message: 'La vinculación solo está disponible en la aplicación de escritorio.'
      })
      setPending(null)
      return
    }
    try {
      const result = await sync.pull()
      setStatus(result.status)
      if (result.ok) {
        const message =
          result.userCount === 1
            ? 'Se guardó 1 usuario del POS.'
            : `Se guardaron ${result.userCount} usuarios del POS.`
        setFeedback({ kind: 'success', message })
      } else {
        setFeedback({ kind: 'error', message: result.message })
      }
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) })
    }
    setPending(null)
  }

  const busy = pending !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustes</DialogTitle>
          <DialogDescription>
            {status?.linked
              ? 'Este punto de venta está vinculado a la administración.'
              : 'Ingresa el código de vinculación generado en la sucursal.'}
          </DialogDescription>
        </DialogHeader>

        {status === null ? (
          <p className='text-muted-foreground text-sm'>Consultando vinculación…</p>
        ) : status.linked ? (
          <LinkedStatus status={status} />
        ) : (
          <form
            className='grid gap-3'
            onSubmit={(event) => {
              event.preventDefault()
              void link()
            }}
          >
            <div className='grid gap-2'>
              <Label htmlFor='pairing-code'>Código de vinculación</Label>
              <Input
                id='pairing-code'
                value={pairingCode}
                onChange={(event) => setPairingCode(event.target.value)}
                autoComplete='off'
                spellCheck={false}
                placeholder='XXXX-XXXX'
                disabled={busy}
              />
            </div>
            <Button type='submit' disabled={busy || pairingCode.trim() === ''}>
              {pending === 'pair' ? 'Vinculando…' : 'Vincular'}
            </Button>
          </form>
        )}

        {feedback ? (
          <p
            className={
              feedback.kind === 'error' ? 'text-destructive text-sm' : 'text-positive text-sm'
            }
          >
            {feedback.message}
          </p>
        ) : null}

        {status?.linked ? (
          <DialogFooter>
            <Button type='button' disabled={busy} onClick={() => void updateData()}>
              {pending === 'pull' ? 'Actualizando…' : 'Actualizar datos'}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function LinkedStatus({ status }: { status: DeviceLinkView }) {
  const deviceName = status.device?.name?.trim() || 'Sin nombre'
  const deviceStatus = status.device ? DEVICE_STATUS_LABEL[status.device.status] : null
  const branchName = status.branch?.name ?? 'Sin datos de la sucursal'
  const branchAddress = status.branch?.address?.trim() || 'Sin dirección'

  return (
    <dl className='grid gap-3 text-sm'>
      <div className='grid gap-1'>
        <dt className='text-muted-foreground'>Dispositivo</dt>
        <dd>
          {deviceName}
          {deviceStatus ? ` · ${deviceStatus}` : null}
        </dd>
      </div>
      <div className='grid gap-1'>
        <dt className='text-muted-foreground'>Sucursal</dt>
        <dd>{branchName}</dd>
      </div>
      <div className='grid gap-1'>
        <dt className='text-muted-foreground'>Dirección</dt>
        <dd>{status.branch ? branchAddress : 'Sin dirección'}</dd>
      </div>
      <div className='grid gap-1'>
        <dt className='text-muted-foreground'>Estado de la sucursal</dt>
        <dd>{status.branch ? (status.branch.active ? 'Activa' : 'Inactiva') : 'Sin datos'}</dd>
      </div>
    </dl>
  )
}
