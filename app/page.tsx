// app/page.tsx
import { CreateEchoForm } from '@/components/create-echo-form'

export default function Home() {
  return (
      <main className="p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Echo</h1>
        <CreateEchoForm />
      </main>
  )
}