'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — pattern estándar de next-themes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-7" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-md p-1.5 text-green-200 transition hover:bg-white/10 hover:text-white"
      aria-label="Cambiar tema"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
