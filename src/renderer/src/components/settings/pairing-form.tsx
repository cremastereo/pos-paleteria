import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { readSyncApi } from '@/lib/sync'
import type { DeviceLinkView } from '../../../../shared/sync-api'

const PAIRING_CODE_LENGTH = 8
const pairingSlotClassName = 'h-10 w-10 text-base font-medium'

function formatPairingCode(value: string) {
  const code = value.toUpperCase()
  return `${code.slice(0, 4)}-${code.slice(4, PAIRING_CODE_LENGTH)}`
}

export function PairingForm({ onLinked }: { onLinked: (status: DeviceLinkView) => void }) {
  const [pairingCode, setPairingCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function link() {
    if (pairingCode.length < PAIRING_CODE_LENGTH) return
    setPending(true)
    setError(null)
    const sync = readSyncApi()
    if (!sync) {
      setError('La vinculación solo está disponible en la aplicación de escritorio.')
      setPending(false)
      return
    }
    try {
      const result = await sync.pair(formatPairingCode(pairingCode))
      if (result.ok) {
        setPairingCode('')
        onLinked(result.status)
      } else {
        setError(result.message)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo completar la operación.')
    }
    setPending(false)
  }

  return (
    <form
      className='flex w-full max-w-md flex-col items-center gap-4'
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
          disabled={pending}
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
      <Button
        type='submit'
        className='w-full max-w-xs'
        disabled={pending || pairingCode.length < PAIRING_CODE_LENGTH}
      >
        {pending ? 'Vinculando…' : 'Vincular'}
      </Button>
      {error ? <p className='text-center text-sm text-destructive'>{error}</p> : null}
    </form>
  )
}
