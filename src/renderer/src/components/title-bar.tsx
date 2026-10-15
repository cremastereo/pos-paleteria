import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { SettingsButton } from '@/components/settings/settings-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFiscalPrinter } from '@/fiscal/state/printer'
import { usePosSession } from '@/session'
import type { WindowApi } from '../../../shared/window-api'

function readWindowApi(): WindowApi | null {
  const candidate: unknown = window.windowControls
  if (typeof candidate !== 'object' || candidate === null) return null
  if (!('minimize' in candidate) || !('toggleMaximize' in candidate) || !('close' in candidate)) {
    return null
  }
  return candidate as WindowApi
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const api = readWindowApi()
    if (!api) return
    let active = true
    void api.isMaximized().then((value) => {
      if (active) setMaximized(value)
    })
    const unsubscribe = api.onMaximizedChange(setMaximized)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  function run(action: (api: WindowApi) => Promise<unknown>) {
    const api = readWindowApi()
    if (!api) return
    void action(api)
  }

  return (
    <header
      className='relative z-60 flex h-10 shrink-0 items-center bg-cspurple text-white select-none [-webkit-app-region:drag]'
      onDoubleClick={() => run((api) => api.toggleMaximize())}
    >
      <span className='ml-3 size-2 shrink-0 rounded-full bg-csyellow' />
      <p className='pointer-events-none pl-2 text-sm font-medium'>Crema Stereo POS</p>
      <div
        className='ml-auto flex h-full items-center [-webkit-app-region:no-drag]'
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <FiscalStatusDot />
        <LogoutButton />
        <SettingsButton />
        <span className='mx-1 h-4 w-px bg-white/25' />
        <CaptionButton label='Minimizar' onClick={() => run((api) => api.minimize())}>
          <MinusIcon />
        </CaptionButton>
        <CaptionButton
          label={maximized ? 'Restaurar' : 'Maximizar'}
          onClick={() => run((api) => api.toggleMaximize())}
        >
          {maximized ? <RestoreIcon /> : <MaximizeIcon />}
        </CaptionButton>
        <CaptionButton label='Cerrar' close onClick={() => run((api) => api.close())}>
          <CloseIcon />
        </CaptionButton>
      </div>
    </header>
  )
}

function FiscalStatusDot() {
  const { status } = useFiscalPrinter()
  if (status === 'unconfigured') return null
  const active = status === 'active'
  const label = active ? 'Máquina fiscal activa' : 'Máquina fiscal inactiva'

  return (
    <Tooltip>
      <TooltipTrigger
        type='button'
        aria-label={label}
        className='flex h-full w-8 items-center justify-center'
      >
        <span
          className={
            active ? 'size-2.5 rounded-full bg-positive' : 'size-2.5 rounded-full bg-destructive'
          }
        />
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

function LogoutButton() {
  const { user, clearUser } = usePosSession()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <Tooltip>
      <TooltipTrigger
        type='button'
        aria-label='Cerrar sesión'
        className='flex h-full w-11 items-center justify-center text-white hover:bg-white/15'
        onClick={() => {
          clearUser()
          void navigate({ to: '/' })
        }}
      >
        <LogOut className='size-4' />
      </TooltipTrigger>
      <TooltipContent side='bottom'>Cerrar sesión</TooltipContent>
    </Tooltip>
  )
}

function CaptionButton({
  label,
  close = false,
  onClick,
  children
}: {
  label: string
  close?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type='button'
      aria-label={label}
      className={
        close
          ? 'flex h-full w-11 items-center justify-center text-white hover:bg-destructive'
          : 'flex h-full w-11 items-center justify-center text-white hover:bg-white/15'
      }
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function MinusIcon() {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10' aria-hidden='true'>
      <path fill='currentColor' d='M0 4.5h10v1H0z' />
    </svg>
  )
}

function MaximizeIcon() {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10' fill='none' aria-hidden='true'>
      <rect x='0.5' y='0.5' width='9' height='9' stroke='currentColor' />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10' fill='none' aria-hidden='true'>
      <rect x='2.5' y='0.5' width='7' height='7' stroke='currentColor' />
      <path fill='currentColor' d='M0 3h1v6h6v1H0z' />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10' aria-hidden='true'>
      <path
        fill='currentColor'
        d='M1.1 0 5 3.9 8.9 0 10 1.1 6.1 5 10 8.9 8.9 10 5 6.1 1.1 10 0 8.9 3.9 5 0 1.1z'
      />
    </svg>
  )
}
