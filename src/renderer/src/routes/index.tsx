import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Crema Stereo POS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-medium">Hola Mundo</p>
        </CardContent>
      </Card>
    </main>
  )
}
