import { Monitor, Settings, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { useFiscalPrinter } from '@/fiscal/state/printer'
import { readSyncApi } from '@/lib/sync'
import { type DeviceLinkView, type DeviceStatus, unlinkedStatus } from '../../../../shared/sync-api'

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
      <DialogContent className='sm:max-w-md'>
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
  const {
    port,
    ports,
    portsLoading,
    serviceReady,
    status,
    reconnecting,
    refreshPorts,
    selectPort,
    reconnectPort
  } = useFiscalPrinter()
  const [note, setNote] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!open) return
    void refreshPorts()
  }, [open, refreshPorts])

  useEffect(() => {
    setNote(null)
  }, [open, port])

  async function reopenPort() {
    setNote(null)
    const result = await reconnectPort()
    if (result === 'active') {
      setNote({ kind: 'success', message: 'Puerto cerrado y abierto. La máquina fiscal responde.' })
      return
    }
    if (result === 'inactive') {
      setNote({
        kind: 'error',
        message: 'Se cerró y abrió el puerto, pero la máquina no responde.'
      })
      return
    }
    if (result === 'busy') {
      setNote({ kind: 'error', message: 'El servicio fiscal está ocupado. Intenta de nuevo.' })
      return
    }
    setNote({ kind: 'error', message: 'El servicio fiscal no está listo para reabrir el puerto.' })
  }

  const options = port && !ports.includes(port) ? [port, ...ports] : ports

  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>Máquina fiscal</CardTitle>
        <CardDescription>
          Elige el puerto COM de la impresora. Queda guardado en este equipo.
        </CardDescription>
        <CardAction>
          <PrinterBadge status={status} reconnecting={reconnecting} />
        </CardAction>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <Label>Puerto COM</Label>
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <Select
              value={port ?? undefined}
              onValueChange={(value) => {
                if (value) selectPort(value)
              }}
              disabled={!serviceReady || reconnecting}
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={portsLoading ? 'Buscando puertos…' : 'Selecciona un puerto'}
                />
              </SelectTrigger>
              <SelectContent className='z-80'>
                {options.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type='button'
            variant='outline'
            className='shrink-0'
            disabled={!serviceReady || !port || reconnecting}
            onClick={() => void reopenPort()}
          >
            {reconnecting ? 'Cerrando…' : 'Cerrar y abrir'}
          </Button>
        </div>
        {note ? (
          <p
            className={note.kind === 'error' ? 'text-destructive text-sm' : 'text-positive text-sm'}
          >
            {note.message}
          </p>
        ) : null}
        {serviceReady ? null : (
          <p className='text-sm text-muted-foreground'>
            El servicio fiscal no está listo para consultar los puertos.
          </p>
        )}
        {serviceReady && !portsLoading && ports.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No hay puertos COM disponibles.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function PrinterBadge({
  status,
  reconnecting
}: {
  status: 'unconfigured' | 'active' | 'inactive'
  reconnecting: boolean
}) {
  if (reconnecting) return <Badge variant='alert'>Reconectando</Badge>
  if (status === 'active') return <Badge variant='positive'>Activa</Badge>
  if (status === 'inactive') return <Badge variant='destructive'>Inactiva</Badge>
  return <Badge variant='outline'>Sin puerto</Badge>
}

function LinkedStatus({ status }: { status: DeviceLinkView }) {
  const deviceName = status.device?.name?.trim() || 'Sin nombre'
  const branchName = status.branch?.name ?? 'Sin sucursal'
  const branchAddress = status.branch?.address?.trim() || 'Sin dirección'

  return (
    <Card size='sm' className='gap-0 py-0'>
      <CardHeader className='py-(--card-spacing)'>
        <div className='flex min-w-0 items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-cspurple text-white'>
            <Store />
          </div>
          <div className='min-w-0'>
            <p className='text-xs text-muted-foreground'>Sucursal</p>
            <CardTitle className='text-base text-pretty text-cspurple'>{branchName}</CardTitle>
            <CardDescription className='mt-0.5 text-pretty text-xs'>
              {branchAddress}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <BranchBadge active={status.branch ? status.branch.active : null} />
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className='flex items-center gap-3 py-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-cspurple'>
          <Monitor />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-muted-foreground'>Dispositivo</p>
          <p className='font-medium text-pretty'>{deviceName}</p>
        </div>
        <DeviceBadge status={status.device?.status ?? null} />
      </CardContent>
    </Card>
  )
}

function BranchBadge({ active }: { active: boolean | null }) {
  if (active === null) return <Badge variant='outline'>Sin datos</Badge>
  if (active) return <Badge variant='positive'>Activa</Badge>
  return <Badge variant='destructive'>Inactiva</Badge>
}

function DeviceBadge({ status }: { status: DeviceStatus | null }) {
  if (status === null) return <Badge variant='outline'>Sin estado</Badge>
  if (status === 'active') return <Badge variant='positive'>{DEVICE_STATUS_LABEL.active}</Badge>
  if (status === 'pending') return <Badge variant='alert'>{DEVICE_STATUS_LABEL.pending}</Badge>
  return <Badge variant='destructive'>{DEVICE_STATUS_LABEL.revoked}</Badge>
}
