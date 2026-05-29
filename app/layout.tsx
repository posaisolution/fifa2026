import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'Álbum 2026', template: '%s | Álbum 2026' },
  description: 'Tu álbum digital del Mundial de Fútbol FIFA 2026 — USA · México · Canadá',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1a472a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
