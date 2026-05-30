'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/album', label: 'Álbum', icon: '📖', 'data-tour': 'album' },
  { href: '/sobres', label: 'Sobres', icon: '🎁', 'data-tour': 'sobres' },
  { href: '/buscar', label: 'Buscar', icon: '🔍', 'data-tour': 'buscar' },
  { href: '/torneo', label: 'Torneo', icon: '🏆' },
  { href: '/intercambios', label: 'Intercambios', icon: '🔄', 'data-tour': 'intercambios' },
  { href: '/stats', label: 'Estadísticas', icon: '📊' },
  { href: '/como-jugar', label: 'Ayuda', icon: '❓', 'data-tour': 'ayuda' },
]

export function MobileMenuButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger button — solo en móvil */}
      <button
        onClick={() => setOpen(!open)}
        className="flex size-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
        aria-label="Menú"
      >
        <span className="text-xl">{open ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-[#0d2b1a] text-white shadow-2xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold">Álbum 2026</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-green-300 hover:text-white">
            ✕
          </button>
        </div>

        {/* Links */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-tour={link['data-tour']}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-green-200 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                    {isActive && <span className="ml-auto size-1.5 rounded-full bg-[#d4af37]" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
