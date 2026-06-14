import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  UploadCloud,
} from 'lucide-react'
import { api, apiError } from '../lib/api'
import type { DashboardStats } from '../lib/types'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDate } from '../lib/format'

const PIE_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<DashboardStats>('/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="card p-6 text-rose-700">{error || 'Unable to load dashboard.'}</div>
    )
  }

  const cards = [
    {
      label: 'Total documents',
      value: stats.totalDocuments,
      icon: FileCheck2,
      tint: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Compliant',
      value: stats.compliant,
      icon: ShieldCheck,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Needs review',
      value: stats.needsReview,
      icon: AlertTriangle,
      tint: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Non-compliant',
      value: stats.nonCompliant,
      icon: XCircle,
      tint: 'bg-rose-50 text-rose-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5 transition hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${c.tint}`}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-ink-900">{c.value}</p>
            <p className="text-sm text-ink-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink-900">Compliance score trend</h2>
              <p className="text-sm text-ink-500">Average AI score over recent uploads</p>
            </div>
            <span className="badge bg-brand-50 text-brand-700">
              Avg {stats.averageScore}%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.scoreTrend} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#scoreFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink-900">By category</h2>
          <p className="text-sm text-ink-500">Documents analysed per type</p>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-400">No data yet.</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {stats.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-2">
                {stats.categoryBreakdown.map((c, i) => (
                  <li key={c.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {c.category}
                    </span>
                    <span className="font-semibold text-ink-800">{c.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Recent documents */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <h2 className="text-base font-semibold text-ink-900">Recent documents</h2>
          <Link
            to="/app/documents"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.recentDocuments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <UploadCloud className="h-10 w-10 text-ink-300" />
            <p className="text-sm text-ink-500">
              No documents yet. Upload your first file to run a compliance scan.
            </p>
            <Link to="/app/upload" className="btn-primary">
              <UploadCloud className="h-4 w-4" /> Upload document
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {stats.recentDocuments.map((d) => (
                  <tr key={d.id} className="hover:bg-ink-50/60">
                    <td className="px-6 py-3 font-medium text-ink-800">{d.title}</td>
                    <td className="px-6 py-3 text-ink-600">{d.category}</td>
                    <td className="px-6 py-3">
                      <span className="font-semibold text-ink-800">{d.complianceScore}%</span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-3 text-ink-500">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
