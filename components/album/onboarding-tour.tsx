'use client'

import { useEffect } from 'react'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'album2026-tour-done'

export function OnboardingTour() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(TOUR_KEY)) return

    async function startTour() {
      const { driver } = await import('driver.js')

      const driverObj = driver({
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Atrás',
        doneBtnText: '¡Listo! 🎉',
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, '1')
          driverObj.destroy()
        },
        steps: [
          {
            element: '[data-tour="album"]',
            popover: {
              title: '📖 Tu Álbum',
              description:
                'Aquí ves todos los grupos del Mundial (A–L) con tus equipos y el progreso de cada uno.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="sobres"]',
            popover: {
              title: '🎁 Abre Sobres',
              description:
                'Tienes 1 sobre gratis cada 24 horas. Cada sobre trae 5 figuritas aleatorias: Común, Raro o Leyenda.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="buscar"]',
            popover: {
              title: '🔍 Busca jugadores',
              description:
                'Encuentra cualquier jugador por nombre o equipo. Filtra por posición o estado (tienes / te falta).',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="intercambios"]',
            popover: {
              title: '🔄 Intercambios',
              description:
                'Cuando tengas figuritas repetidas, puedes intercambiarlas con otros usuarios. Hay tablero público y solicitudes directas.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="coins"]',
            popover: {
              title: '🪙 Tus monedas',
              description:
                'Empiezas con 100 monedas. Las figuritas repetidas te dan monedas de compensación. Úsalas para comprar más sobres.',
              side: 'bottom',
              align: 'end',
            },
          },
          {
            element: '[data-tour="ayuda"]',
            popover: {
              title: '❓ Guía completa',
              description:
                '¿Tienes dudas? Aquí encontrarás todas las instrucciones del juego explicadas paso a paso.',
              side: 'bottom',
              align: 'end',
            },
          },
        ],
      })

      // Small delay so the page renders fully before the tour starts
      setTimeout(() => driverObj.drive(), 800)
    }

    startTour()
  }, [])

  return null
}
