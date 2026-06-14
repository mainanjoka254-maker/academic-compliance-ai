import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { api, apiError } from '../lib/api'
import type { DocumentRecord } from '../lib/types'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatBytes } from '../lib/format'

const categories = [
  'Syllabus',
  'Course Outline',
  'Exam Paper',
  'Research Paper',
  'Policy Document',
  'Accreditation Report',
  'Other',
]

export function Upload() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DocumentRecord | null>(null)

  function pick(f: File | null) {
    if (!f) return
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files?.[0] ?? null)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    pick(e.target.files?.[0] ?? null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please choose a file to upload.')
      return
    }
    setError('')
    setUploading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('title', title)
      form.append('category', category)
      const { data } = await api.post<{ document: DocumentRecord }>('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data.document)
      setFile(null)
      setTitle('')
    } catch (err) {
      setError(apiError(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <form onSubmit={onSubmit} className="card space-y-5 p-6 lg:col-span-3">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-300 hover:border-brand-400 hover:bg-ink-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onChange}
            accept=".pdf,.doc,.docx,.txt,.rtf,.md,.csv,.xlsx,.ppt,.pptx"
          />
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-600">
            <UploadCloud className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold text-ink-800">
            Drag & drop a document, or click to browse
          </p>
          <p className="mt-1 text-sm text-ink-500">PDF, DOCX, TXT, XLSX up to 20MB</p>
        </div>

        {file && (
          <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
            <FileText className="h-5 w-5 text-brand-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-800">{file.name}</p>
              <p className="text-xs text-ink-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-white hover:text-rose-600"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="title">
              Document title
            </label>
            <input
              id="title"
              className="input"
              placeholder="e.g. CS101 Syllabus 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={uploading}>
          {uploading ? <Spinner /> : <Sparkles className="h-4 w-4" />}
          {uploading ? 'Analysing with AI...' : 'Upload & run compliance check'}
        </button>
      </form>

      <div className="lg:col-span-2">
        {result ? (
          <div className="card animate-fade-in space-y-4 p-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">Analysis complete</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">{result.title}</h3>
              <p className="text-sm text-ink-500">{result.category}</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-4 text-center">
              <p className="text-4xl font-extrabold text-brand-600">{result.complianceScore}%</p>
              <p className="text-sm text-ink-500">Compliance score</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Status</span>
              <StatusBadge status={result.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Issues detected</span>
              <span className="font-semibold text-ink-800">{result.issues}</span>
            </div>
            {result.summary && (
              <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-900">{result.summary}</p>
            )}
            <button onClick={() => navigate('/app/documents')} className="btn-secondary w-full">
              View all documents
            </button>
          </div>
        ) : (
          <div className="card flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
              <Sparkles className="h-7 w-7" />
            </span>
            <h3 className="font-semibold text-ink-800">AI compliance engine</h3>
            <p className="text-sm text-ink-500">
              Upload a document and our engine scores it against academic compliance rules,
              flags issues, and produces an audit-ready summary.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
