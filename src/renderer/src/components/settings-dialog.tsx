import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { Monitor, Settings, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
  type DeviceLinkView,
  type DeviceStatus,
  type SyncApi,
  unlinkedStatus
} from '../../../shared/sync-api'

const PAIRING_CODE_LENGTH = 8
const pairingSlotClassName = 'h-10 w-10 text-base font-medium'

function formatPairingCode(value: string) {
  const code = value.toUpperCase()
  return `${code.slice(0, 4)}-${code.slice(4, PAIRING_CODE_LENGTH)}`
}

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
    if (pairingCode.length < PAIRING_CODE_LENGTH) return
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
      const result = await sync.pair(formatPairingCode(pairingCode))
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
            className='grid gap-4'
            onSubmit={(event) => {
              event.preventDefault()
              void link()
            }}
          >
            <div className='flex flex-col items-center gap-3'>
              <Label htmlFor='pairing-code'>Código de vinculación</Label>
              <InputOTP
                id='pairing-code'
                maxLength={PAIRING_CODE_LENGTH}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={pairingCode}
                onChange={(value) => setPairingCode(value.toUpperCase())}
                pasteTransformer={(pasted) => pasted.replace(/[^a-zA-Z0-9]/g, '')}
                autoComplete='off'
                spellCheck={false}
                disabled={busy}
                containerClassName='justify-center'
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className={pairingSlotClassName} />
                  <InputOTPSlot index={1} className={pairingSlotClassName} />
                  <InputOTPSlot index={2} className={pairingSlotClassName} />
                  <InputOTPSlot index={3} className={pairingSlotClassName} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} className={pairingSlotClassName} />
                  <InputOTPSlot index={5} className={pairingSlotClassName} />
                  <InputOTPSlot index={6} className={pairingSlotClassName} />
                  <InputOTPSlot index={7} className={pairingSlotClassName} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type='submit' disabled={busy || pairingCode.length < PAIRING_CODE_LENGTH}>
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
            <Button
              type='button'
              className='w-full'
              disabled={busy}
              onClick={() => void updateData()}
            >
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
  const branchName = status.branch?.name ?? 'Sin sucursal'
  const branchAddress = status.branch?.address?.trim() || 'Sin dirección'

  return (
    <section className='overflow-hidden rounded-xl border bg-card'>
      <div className='flex items-start gap-3 bg-cspurple-50 px-4 py-4'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-cspurple text-white'>
          <Store />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-muted-foreground text-xs'>Sucursal</p>
          <p className='text-base font-medium text-pretty text-cspurple'>{branchName}</p>
          <p className='mt-0.5 text-sm text-pretty text-muted-foreground'>{branchAddress}</p>
        </div>
        <BranchBadge active={status.branch ? status.branch.active : null} />
      </div>
      <div className='flex items-center gap-3 border-t px-4 py-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-cspurple'>
          <Monitor />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-muted-foreground text-xs'>Dispositivo</p>
          <p className='font-medium text-pretty'>{deviceName}</p>
        </div>
        <DeviceBadge status={status.device?.status ?? null} />
      </div>
    </section>
  )
}

function BranchBadge({ active }: { active: boolean | null }) {
  if (active === null) return <Badge variant='outline'>Sin datos</Badge>
  if (active) {
    return (
      <Badge className='border-border-positive bg-positive-muted text-positive-muted-foreground'>
        Activa
      </Badge>
    )
  }
  return (
    <Badge className='border-border-destructive bg-destructive-muted text-destructive'>
      Inactiva
    </Badge>
  )
}

function DeviceBadge({ status }: { status: DeviceStatus | null }) {
  if (status === null) return <Badge variant='outline'>Sin estado</Badge>
  if (status === 'active') {
    return (
      <Badge className='border-border-positive bg-positive-muted text-positive-muted-foreground'>
        {DEVICE_STATUS_LABEL.active}
      </Badge>
    )
  }
  if (status === 'pending') {
    return (
      <Badge className='border-csyellow-300 bg-csyellow-100 text-cspurple'>
        {DEVICE_STATUS_LABEL.pending}
      </Badge>
    )
  }
  return (
    <Badge className='border-border-destructive bg-destructive-muted text-destructive'>
      {DEVICE_STATUS_LABEL.revoked}
    </Badge>
  )
}
