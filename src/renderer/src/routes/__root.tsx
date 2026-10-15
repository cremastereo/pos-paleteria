import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TitleBar } from '@/components/title-bar'
import { Toaster } from '@/components/ui/toast'
import { FiscalPrinterProvider } from '@/fiscal/state/printer'
import { PosSessionProvider } from '@/session'

export const Route = createRootRoute({
  component: function Root() {
    return (
      <PosSessionProvider>
        <FiscalPrinterProvider>
          <div className='flex h-full flex-col'>
            <TitleBar />
            <div className='min-h-0 flex-1'>
              <Outlet />
            </div>
          </div>
          <Toaster />
        </FiscalPrinterProvider>
      </PosSessionProvider>
    )
  }
})
