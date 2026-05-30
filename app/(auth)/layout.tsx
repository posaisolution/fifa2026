import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceder',
}

const features = [
  {
    icon: '🎁',
    title: 'Abre sobres de figuritas',
    desc: 'Un sobre gratis cada día con 5 figuritas aleatorias. Común, Raro o Leyenda.',
  },
  {
    icon: '⭐',
    title: '235 jugadores, 47 selecciones',
    desc: 'Todos los equipos del Mundial FIFA 2026: USA · México · Canadá y más.',
  },
  {
    icon: '🔄',
    title: 'Intercambia con otros usuarios',
    desc: 'Publica tus repetidas en el tablero o propón intercambios directos.',
  },
  {
    icon: '📊',
    title: 'Sigue tu progreso',
    desc: 'Estadísticas por confederación, posición y porcentaje completado en tiempo real.',
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* LEFT — branding */}
      <div className="relative hidden flex-col justify-between bg-linear-to-b from-[#1a472a] to-[#0a1f10] p-10 text-white lg:flex lg:w-1/2">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">⚽</span>
          <div>
            <p className="text-2xl leading-none font-bold">Álbum 2026</p>
            <p className="text-xs text-green-300">FIFA World Cup Digital</p>
          </div>
        </div>

        {/* Center content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl leading-tight font-bold">
              Tu álbum digital
              <br />
              <span className="text-[#d4af37]">del Mundial 2026</span>
            </h1>
            <p className="mt-3 text-lg text-green-200">
              Colecciona, intercambia y completa el álbum digital de la Copa del Mundo.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-green-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 text-xs text-green-400">
          <span>🏟️ USA · México · Canadá</span>
          <span>·</span>
          <span>48 equipos · Junio 2026</span>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 size-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 dark:bg-gray-950">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <span className="text-5xl">⚽</span>
          <p className="mt-2 text-2xl font-bold">Álbum 2026</p>
          <p className="text-sm text-gray-500">FIFA World Cup · USA · México · Canadá</p>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
