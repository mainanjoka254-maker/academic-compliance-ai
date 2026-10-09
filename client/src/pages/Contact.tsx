import { useState, type FormEvent } from 'react'
import { Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react'
import { api, apiError } from '../lib/api'
import { CONTACT } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'

export function Contact() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await api.post('/contact', { name, email, subject, message: body })
      setSent(true)
      setSubject('')
      setBody('')
    } catch (err) {
      setError(apiError(err, 'Could not send message'))
    } finally {
      setSending(false)
    }
  }

  const channels = [
    {
      icon: Phone,
      label: 'Call us',
      value: CONTACT.phone,
      href: CONTACT.phoneHref,
    },
    {
      icon: Mail,
      label: 'Email us',
      value: CONTACT.email,
      href: CONTACT.emailHref,
    },
    {
      icon: Clock,
      label: 'Working hours',
      value: CONTACT.hours,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink-900">Get in touch</h2>
          <p className="mt-1 text-sm text-ink-500">
            Questions about compliance, billing, or onboarding? Our team responds within one
            business day.
          </p>
          <div className="mt-6 space-y-4">
            {channels.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-400">{c.label}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="font-semibold text-ink-800 hover:text-brand-600"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-ink-800">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
          <MessageSquare className="h-7 w-7 text-brand-200" />
          <p className="mt-3 font-semibold">Prefer a quick chat?</p>
          <p className="mt-1 text-sm text-brand-100">
            Call <span className="font-semibold">{CONTACT.phone}</span> and we'll walk you
            through setting up compliance for your institution.
          </p>
        </div>
      </div>

      <div className="card p-6 lg:col-span-3">
        {sent ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Send className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-bold text-ink-900">Message sent!</h3>
            <p className="max-w-sm text-sm text-ink-500">
              Thanks for reaching out. We've received your message and will reply to{' '}
              <span className="font-medium text-ink-700">{email}</span> shortly.
            </p>
            <button onClick={() => setSent(false)} className="btn-secondary mt-2">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-ink-900">Send us a message</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-name">
                  Name
                </label>
                <input
                  id="c-name"
                  className="input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="c-email">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className="input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="c-subject">
                Subject
              </label>
              <input
                id="c-subject"
                className="input"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="c-body">
                Message
              </label>
              <textarea
                id="c-body"
                className="input min-h-[140px] resize-y"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={sending}>
              {sending ? <Spinner /> : <Send className="h-4 w-4" />}
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
