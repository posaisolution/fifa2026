'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'

type Stats = {
  total: number
  owned: number
  duplicates: number
  completionPercentage: number
  byConfederation: { name: string; total: number; owned: number }[]
  byPosition: { name: string; total: number; owned: number }[]
}

const POSITION_LABEL: Record<string, string> = {
  GK: 'Portero',
  DEF: 'Defensa',
  MID: 'Mediocampista',
  FWD: 'Delantero',
}

const PIE_COLORS = ['#1a472a', '#d4af37', '#3b82f6', '#f97316']

export function StatsClient({ stats }: { stats: Stats }) {
  const confData = stats.byConfederation.map((c) => ({
    name: c.name,
    Tengo: c.owned,
    Faltan: c.total - c.owned,
  }))

  const posData = stats.byPosition.map((p, i) => ({
    name: POSITION_LABEL[p.name] ?? p.name,
    value: p.owned,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Estadísticas</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Completado"
          value={`${stats.completionPercentage.toFixed(1)}%`}
          color="text-[#1a472a]"
        />
        <StatCard label="Figuritas" value={`${stats.owned}/${stats.total}`} color="text-blue-600" />
        <StatCard label="Faltan" value={`${stats.total - stats.owned}`} color="text-red-500" />
        <StatCard label="Repetidas" value={`${stats.duplicates}`} color="text-orange-500" />
      </div>

      {/* Bar chart — by confederation */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-800">Por confederación</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={confData} barSize={18} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="Tengo" stackId="a" fill="#1a472a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Faltan" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart — by position */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-800">Figuritas conseguidas por posición</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={posData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {posData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
