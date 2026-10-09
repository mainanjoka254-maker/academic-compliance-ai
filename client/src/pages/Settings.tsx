import { useState, type FormEvent } from 'react'
import { Save, User, Building2, ShieldCheck } from 'lucide-react'
import { api, apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'

export function Settings() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [institution, setInstitution] = useState(user?.institution ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await api.patch('/auth/me', { name, institution })
      await refresh()
      setMessage('Profile updated.')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <h2 className="text-lg font-bold text-ink-900">Profile</h2>

        <div>
          <label className="label" htmlFor="s-name">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="s-name"
              className="input pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="s-institution">
            Institution
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="s-institution"
              className="input pl-9"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University of Nairobi"
            />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input bg-ink-50 text-ink-500" value={user?.email ?? ''} disabled />
        </div>

        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
        )}
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </form>

      <div className="card flex items-center gap-4 p-6">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-ink-900">Current plan</p>
          <p className="text-sm capitalize text-ink-500">{user?.plan ?? 'free'}</p>
        </div>
        <a href="/app/subscription" className="btn-secondary">
          Manage
        </a>
      </div>
    </div>
  )
}
