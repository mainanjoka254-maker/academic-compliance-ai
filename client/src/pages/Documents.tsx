import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, FileText, UploadCloud, Filter } from 'lucide-react'
import { api, apiError } from '../lib/api'
import type { ComplianceStatus, DocumentRecord } from '../lib/types'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatBytes, formatDate, statusMeta } from '../lib/format'

const filters: { value: ComplianceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'review', label: 'Needs review' },
  { value: 'non_compliant', label: 'Non-compliant' },
  { value: 'pending', label: 'Pending' },
]

export function Documents() {
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ComplianceStatus | 'all'>('all')

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get<{ documents: DocumentRecord[] }>('/documents')
      setDocs(data.documents)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id: number) {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const prev = docs
    setDocs((d) => d.filter((x) => x.id !== id))
    try {
      await api.delete(`/documents/${id}`)
    } catch (err) {
      setError(apiError(err))
      setDocs(prev)
    }
  }

  const visible = useMemo(() => {
    return docs.filter((d) => {
      const matchesStatus = status === 'all' || d.status === status
      const matchesQuery =
        !query ||
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesQuery
    })
  }, [docs, status, query])

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search by title or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Link to="/app/upload" className="btn-primary">
          <UploadCloud className="h-4 w-4" /> Upload document
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-ink-500">
          <Filter className="h-4 w-4" /> Filter:
        </span>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              status === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="card p-4 text-rose-700">{error}</div>}

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <FileText className="h-10 w-10 text-ink-300" />
          <p className="text-sm text-ink-500">No documents match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => (
            <article key={d.id} className="card flex flex-col p-5 transition hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${statusMeta[d.status].className}`}>
                  <FileText className="h-5 w-5" />
                </span>
                <button
                  onClick={() => remove(d.id)}
                  className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-3 truncate font-semibold text-ink-900" title={d.title}>
                {d.title}
              </h3>
              <p className="text-sm text-ink-500">
                {d.category} · {formatBytes(d.fileSize)}
              </p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
                  <span>Compliance score</span>
                  <span className="font-semibold text-ink-700">{d.complianceScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${d.complianceScore}%` }}
                  />
                </div>
              </div>

              {d.summary && <p className="mt-3 line-clamp-2 text-sm text-ink-600">{d.summary}</p>}

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                <StatusBadge status={d.status} />
                <span className="text-xs text-ink-400">{formatDate(d.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
