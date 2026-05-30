import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Navbar } from '@/components/album/navbar'

async function AdminContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/album')

  const [users, teams, players, totalStickers, ownedStickers] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        album: { select: { completionPercentage: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.team.count(),
    db.player.count(),
    db.sticker.count(),
    db.sticker.count({ where: { status: { in: ['OWNED', 'DUPLICATE'] } } }),
  ])

  const globalPct = totalStickers > 0 ? (ownedStickers / totalStickers) * 100 : 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      {/* Global stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Usuarios', value: users.length, color: 'text-blue-600' },
          { label: 'Equipos', value: teams, color: 'text-green-700' },
          { label: 'Jugadores', value: players, color: 'text-purple-600' },
          {
            label: 'Figuritas pegadas',
            value: `${globalPct.toFixed(1)}%`,
            color: 'text-[#d4af37]',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b p-4 dark:border-gray-700">
          <h2 className="font-semibold">Usuarios registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 dark:border-gray-700">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Álbum</th>
                <th className="px-4 py-3">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 dark:border-gray-700">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#1a472a]"
                          style={{
                            width: `${user.album?.completionPercentage ?? 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {(user.album?.completionPercentage ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<div className="py-12 text-center text-gray-400">Cargando...</div>}>
          <AdminContent />
        </Suspense>
      </main>
    </div>
  )
}
