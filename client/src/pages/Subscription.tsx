import { useState } from 'react'
import { Check, Sparkles, Zap } from 'lucide-react'
import { api, apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { PLANS } from '../lib/constants'
import { Spinner } from '../components/ui/Spinner'

export function Subscription() {
  const { user, refresh } = useAuth()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [pending, setPending] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function choose(planId: string) {
    setPending(planId)
    setError('')
    setMessage('')
    try {
      await api.post('/subscription', { plan: planId, billing })
      await refresh()
      setMessage(
        planId === 'starter'
          ? 'You are on the Starter plan.'
          : `You're subscribed to the ${planId} plan. Welcome aboard!`,
      )
    } catch (err) {
      setError(apiError(err, 'Could not update subscription'))
    } finally {
      setPending(null)
    }
  }

  function priceFor(price: number) {
    if (price === 0) return 0
    return billing === 'yearly' ? Math.round(price * 12 * 0.8) : price
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 px-6 py-10 text-center text-white sm:px-12">
        <span className="badge mx-auto bg-white/15 text-white">
          <Sparkles className="h-3.5 w-3.5" /> Flexible pricing
        </span>
        <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
          Compliance that scales with your institution
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-brand-100">
          From a single lecturer to an entire university — pick the plan that fits, upgrade
          anytime, and only pay for what you need.
        </p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-white/10 p-1 text-sm">
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              billing === 'monthly' ? 'bg-white text-brand-700' : 'text-white/80'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              billing === 'yearly' ? 'bg-white text-brand-700' : 'text-white/80'
            }`}
          >
            Yearly <span className="text-emerald-300">−20%</span>
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const active = user?.plan === plan.id
          const price = priceFor(plan.price)
          return (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 ${
                plan.highlighted ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    plan.highlighted ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
              </div>
              <p className="mt-2 text-sm text-ink-500">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-ink-900">${price}</span>
                <span className="mb-1 text-sm text-ink-500">
                  {plan.price === 0
                    ? '/ forever'
                    : billing === 'yearly'
                      ? '/ year'
                      : '/ month'}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(plan.id)}
                disabled={active || pending !== null}
                className={`mt-6 w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
              >
                {pending === plan.id ? (
                  <Spinner />
                ) : active ? (
                  'Current plan'
                ) : plan.price === 0 ? (
                  'Switch to Starter'
                ) : (
                  'Choose ' + plan.name
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-sm text-ink-500">
        Need a custom enterprise agreement? Reach us on the{' '}
        <a href="/app/contact" className="font-semibold text-brand-600 hover:text-brand-700">
          contact page
        </a>
        .
      </p>
    </div>
  )
}
