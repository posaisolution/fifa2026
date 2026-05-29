import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceder',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a472a] to-[#0d2b1a] px-4">
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">⚽</div>
        <h1 className="text-3xl font-bold text-white">Álbum 2026</h1>
        <p className="mt-1 text-sm text-green-200">FIFA World Cup · USA · México · Canadá</p>
      </div>
      {children}
    </div>
  )
}
