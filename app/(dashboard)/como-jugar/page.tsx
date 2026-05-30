import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Cómo jugar' }

const sections = [
  {
    icon: '⚽',
    title: '¿Qué es el Álbum 2026?',
    color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    iconBg: 'bg-[#1a472a]',
    content: [
      'El Álbum 2026 es tu colección digital de figuritas del Mundial de Fútbol FIFA 2026 (USA · México · Canadá).',
      'Hay 47 selecciones y 235 jugadores en total, organizados en los Grupos A al L.',
      'Tu objetivo: completar el álbum al 100% consiguiendo la figurita de todos los jugadores.',
    ],
  },
  {
    icon: '🎁',
    title: 'Cómo conseguir figuritas',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    iconBg: 'bg-blue-600',
    steps: [
      {
        label: '1 sobre gratis por día',
        desc: 'Cada 24 horas puedes abrir un sobre gratis desde la sección Sobres. ¡No lo dejes pasar!',
      },
      {
        label: 'Compra sobres con monedas',
        desc: 'Cada sobre cuesta 20 monedas y contiene 5 figuritas aleatorias. Empiezas con 100 monedas.',
      },
      {
        label: 'Gana monedas con repetidas',
        desc: 'Cuando te sale una figurita que ya tienes, se marca como REPETIDA y te da monedas de compensación: Común +2 · Raro +5 · Leyenda +15.',
      },
    ],
  },
  {
    icon: '🃏',
    title: 'Rarezas de las figuritas',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    iconBg: 'bg-yellow-500',
    rarities: [
      {
        name: 'Común',
        prob: '70%',
        color: 'bg-slate-100 text-slate-700',
        desc: 'Jugadores regulares de cada selección.',
      },
      {
        name: 'Raro',
        prob: '25%',
        color: 'bg-blue-100 text-blue-700',
        desc: 'Estrellas y titulares destacados.',
      },
      {
        name: '⭐ Leyenda',
        prob: '5%',
        color: 'bg-yellow-100 text-yellow-700',
        desc: 'Los mejores del mundo: Messi, Mbappé, Vinicius y más.',
      },
    ],
  },
  {
    icon: '📖',
    title: 'Cómo navegar el álbum',
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
    iconBg: 'bg-purple-600',
    steps: [
      {
        label: 'Pantalla principal',
        desc: 'Ve el progreso de todos los grupos (A–L). Cada equipo muestra cuántas figuritas llevas.',
      },
      {
        label: 'Página de equipo',
        desc: 'Al entrar a un equipo ves las 5 figuritas. Las que te faltan aparecen en gris con "?". Las que tienes se muestran a color con el gradiente de rareza.',
      },
      {
        label: 'Pegar una figurita',
        desc: 'Si abriste un sobre y conseguiste una figurita, automáticamente aparece en el álbum. También puedes tocarla manualmente para marcarla.',
      },
    ],
  },
  {
    icon: '🔍',
    title: 'Buscador de jugadores',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    iconBg: 'bg-orange-500',
    content: [
      'Desde Buscar puedes encontrar cualquier jugador por nombre o equipo.',
      'Filtra por posición: Portero, Defensa, Mediocampista o Delantero.',
      'Usa los tabs para ver solo los que Tienes, los que Te faltan o las Repetidas.',
      'Al tocar un resultado te lleva directamente a la página de ese equipo.',
    ],
  },
  {
    icon: '🔄',
    title: 'Sistema de intercambios',
    color: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
    iconBg: 'bg-teal-600',
    steps: [
      {
        label: '+ Proponer (intercambio directo)',
        desc: 'Busca la figurita que quieres, ve qué usuario la tiene, y propón el cambio ofreciendo una de tus repetidas.',
      },
      {
        label: '🏪 Tablero (oferta pública)',
        desc: 'Publica una oferta abierta: "Ofrezco esta repetida, busco cualquier Leyenda". Cualquier usuario puede reclamarla y tú aceptas o rechazas.',
      },
      {
        label: 'Recibidas y Enviadas',
        desc: 'Revisa las solicitudes que te llegaron y las que enviaste. Acepta o rechaza desde la pestaña Recibidas.',
      },
    ],
  },
  {
    icon: '📊',
    title: 'Estadísticas',
    color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800',
    iconBg: 'bg-indigo-600',
    content: [
      'Desde Estadísticas puedes ver tu progreso detallado: % completado, figuritas por confederación y por posición.',
      'La barra de progreso en la barra de navegación muestra tu avance en tiempo real.',
      'Tu porcentaje y monedas también se muestran siempre en la parte superior.',
    ],
  },
  {
    icon: '🌙',
    title: 'Modo oscuro y PWA',
    color: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    iconBg: 'bg-gray-700',
    content: [
      'Toca el ícono 🌙/☀️ en la barra de navegación para cambiar entre modo claro y oscuro.',
      'En tu celular puedes instalar la app: desde el navegador selecciona "Agregar a pantalla de inicio" para tener la experiencia completa como una app nativa.',
    ],
  },
]

export default function ComoJugarPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-[#1a472a] to-[#0d2b1a] p-8 text-white">
        <div className="flex items-center gap-4">
          <span className="text-5xl">⚽</span>
          <div>
            <h1 className="text-3xl font-bold">Cómo jugar</h1>
            <p className="mt-1 text-green-200">Guía completa del Álbum 2026</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} className={`rounded-2xl border-2 p-6 ${section.color}`}>
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl text-xl text-white ${section.iconBg}`}
            >
              {section.icon}
            </div>
            <h2 className="text-xl font-bold">{section.title}</h2>
          </div>

          {/* Plain content */}
          {'content' in section && (
            <ul className="space-y-2">
              {section.content!.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="mt-0.5 shrink-0 text-[#1a472a] dark:text-green-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Numbered steps */}
          {'steps' in section && (
            <div className="space-y-3">
              {section.steps!.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-600 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rarities */}
          {'rarities' in section && (
            <div className="space-y-3">
              {section.rarities!.map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${r.color}`}>
                    {r.name}
                  </span>
                  <span className="text-sm font-bold text-gray-500">{r.prob}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{r.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* CTA */}
      <div className="rounded-2xl bg-[#d4af37]/10 p-6 text-center">
        <p className="text-lg font-bold text-[#d4af37]">¡A completar el álbum! 🏆</p>
        <p className="mt-1 text-sm text-gray-500">
          47 equipos · 235 jugadores · USA · México · Canadá
        </p>
        <Link
          href="/sobres"
          className="mt-4 inline-block rounded-xl bg-[#1a472a] px-6 py-3 font-bold text-white transition hover:bg-[#1a472a]/80"
        >
          Abrir mi primer sobre →
        </Link>
      </div>
    </div>
  )
}
