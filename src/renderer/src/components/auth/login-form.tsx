import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group'
import { toast } from '@/components/ui/toast'
import { readAuthApi } from '@/lib/sync'
import { usePosSession } from '@/session'

export function LoginForm() {
  const navigate = useNavigate()
  const { setUser } = usePosSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setPending(true)
    setError(null)
    const auth = readAuthApi()
    if (!auth) {
      setError('El inicio de sesión solo está disponible en la aplicación de escritorio.')
      setPending(false)
      return
    }
    try {
      const result = await auth.login(username, password)
      if (!result.ok) {
        setError(result.message)
        setPending(false)
        return
      }
      setUser(result.user)
      toast.add({ title: 'Iniciaste sesión correctamente.', type: 'success' })
      await navigate({ to: '/pos' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesión.')
    }
    setPending(false)
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className='grid gap-4'
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <InputGroup>
            <InputGroupAddon>
              <User />
            </InputGroupAddon>
            <InputGroupInput
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete='username'
              placeholder='Usuario'
              disabled={pending}
              required
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              placeholder='Contraseña'
              disabled={pending}
              required
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                size='icon-sm'
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {error ? <p className='text-sm text-destructive'>{error}</p> : null}
          <Button type='submit' disabled={pending || username.trim() === '' || password === ''}>
            {pending ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
