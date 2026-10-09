import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'

const highlights = [
  'AI-powered compliance scoring in seconds',
  'Audit-ready reports for accreditation',
  'Built for lecturers, departments & universities',
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold">ComplyAI</p>
            <p className="text-xs text-ink-400">Academic Compliance</p>
          </div>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight">
            Keep every course, syllabus and report perfectly compliant.
          </h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-ink-200">
                <CheckCircle2 className="h-5 w-5 text-brand-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-ink-500">
          © {new Date().getFullYear()} ComplyAI. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="text-lg font-bold text-ink-900">ComplyAI</p>
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
