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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useFiscalPrinter } from '@/fiscal/state/printer'
import { readSyncApi } from '@/lib/sync'
import { type DeviceLinkView, type DeviceStatus, unlinkedStatus } from '../../../shared/sync-api'

const DEVICE_STATUS_LABEL: Record<DeviceStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  revoked: 'Revocado'
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.'
}

type PendingAction = 'status' | 'pull'

interface Feedback {
  kind: 'error' | 'success'
  message: string
}

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        aria-label='Ajustes'
        className='flex h-full w-11 items-center justify-center text-white hover:bg-white/15 [-webkit-app-region:no-drag]'
        onClick={() => setOpen(true)}
      >
        <Settings className='size-4' />
      </button>
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
              : 'No estás vinculado con ninguna sucursal.'}
          </DialogDescription>
        </DialogHeader>

        {status === null ? (
          <p className='text-muted-foreground text-sm'>Consultando vinculación…</p>
        ) : status.linked ? (
          <div className='grid gap-4'>
            <LinkedStatus status={status} />
            <FiscalPrinterSection open={open} />
          </div>
        ) : (
          <FiscalPrinterSection open={open} />
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

function FiscalPrinterSection({ open }: { open: boolean }) {
  const { port, ports, portsLoading, serviceReady, refreshPorts, selectPort } = useFiscalPrinter()

  useEffect(() => {
    if (!open) return
    void refreshPorts()
  }, [open, refreshPorts])

  const options = port && !ports.includes(port) ? [port, ...ports] : ports

  return (
    <section className='grid gap-3 rounded-xl border p-4'>
      <div className='grid gap-1'>
        <h3 className='text-sm font-medium'>Máquina fiscal</h3>
        <p className='text-sm text-pretty text-muted-foreground'>
          Elige el puerto COM de la impresora. Queda guardado en este equipo.
        </p>
      </div>
      <div className='grid gap-2'>
        <Label>Puerto COM</Label>
        <Select value={port ?? undefined} onValueChange={selectPort} disabled={!serviceReady}>
          <SelectTrigger className='w-full'>
            <SelectValue
              placeholder={portsLoading ? 'Buscando puertos…' : 'Selecciona un puerto'}
            />
          </SelectTrigger>
          <SelectContent className='z-80' position='popper'>
            {options.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {serviceReady ? null : (
          <p className='text-sm text-muted-foreground'>
            El servicio fiscal no está listo para consultar los puertos.
          </p>
        )}
        {serviceReady && !portsLoading && ports.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No hay puertos COM disponibles.</p>
        ) : null}
      </div>
    </section>
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
