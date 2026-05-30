import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from './theme-toggle'
import { MobileMenuButton } from './mobile-menu'

async function getAlbumData(userId: string) {
  const album = await db.album.findUnique({
    where: { userId },
    select: { completionPercentage: true, coins: true },
  })
  return { progress: album?.completionPercentage ?? 0, coins: album?.coins ?? 0 }
}

export async function Navbar() {
  const session = await auth()
  if (!session?.user) return null

  const { progress, coins } = await getAlbumData(session.user.id)
  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b bg-[#1a472a] text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Hamburger — solo móvil */}
        <MobileMenuButton />

        {/* Logo */}
        <Link href="/album" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">⚽</span>
          <span className="hidden sm:inline">Álbum 2026</span>
        </Link>

        {/* Navigation — solo desktop */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex lg:gap-2">
          <Link
            data-tour="album"
            href="/album"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            Álbum
          </Link>
          <Link
            data-tour="buscar"
            href="/buscar"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            Buscar
          </Link>
          <Link
            href="/stats"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            Estadísticas
          </Link>
          <Link
            href="/torneo"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            🏆 Torneo
          </Link>
          <Link
            data-tour="intercambios"
            href="/intercambios"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            Intercambios
          </Link>
          <Link
            data-tour="sobres"
            href="/sobres"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            Sobres
          </Link>
          <Link
            data-tour="ayuda"
            href="/como-jugar"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
          >
            ❓ Ayuda
          </Link>
        </nav>

        {/* Spacer en móvil */}
        <div className="flex-1 lg:hidden" />

        {/* Coins + Progress */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            data-tour="coins"
            href="/sobres"
            className="flex items-center gap-1 text-[#d4af37] hover:opacity-80"
          >
            <span className="text-sm">🪙</span>
            <span className="text-xs font-bold">{coins}</span>
          </Link>
          <span className="text-xs text-green-200">{progress.toFixed(1)}%</span>
          <Progress value={progress} className="h-2 w-20 bg-white/20 [&>div]:bg-[#d4af37]" />
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Avatar className="size-8 border border-white/30">
            <AvatarFallback className="bg-[#0d2b1a] text-xs text-white">{initials}</AvatarFallback>
          </Avatar>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button className="text-xs text-green-200 hover:text-white">Salir</button>
          </form>
        </div>
      </div>
    </header>
  )
}
