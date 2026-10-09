import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Sparkles,
  FileCheck2,
  BarChart3,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CONTACT } from '../lib/constants'

const features = [
  {
    icon: Sparkles,
    title: 'AI compliance scoring',
    desc: 'Every document is scored against academic standards in seconds, with clear issue flags.',
  },
  {
    icon: FileCheck2,
    title: 'Document intelligence',
    desc: 'Upload syllabi, exams, policies and reports — we organise and analyse them automatically.',
  },
  {
    icon: BarChart3,
    title: 'Live dashboards',
    desc: 'Track compliance trends, category breakdowns and risk across your whole institution.',
  },
  {
    icon: Lock,
    title: 'Audit-ready & secure',
    desc: 'Role-based access and exportable reports keep you ready for accreditation reviews.',
  },
]

export function Landing() {
  const { user } = useAuth()
  const dest = user ? '/app/dashboard' : '/register'

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-ink-900">ComplyAI</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 md:flex">
            <a href="#features" className="hover:text-ink-900">Features</a>
            <a href="#how" className="hover:text-ink-900">How it works</a>
            <a href="#contact" className="hover:text-ink-900">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to={dest} className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className="badge bg-brand-50 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> AI-driven academic compliance
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
              Stay compliant.
              <span className="text-brand-600"> Effortlessly.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-600">
              ComplyAI analyses your syllabi, exams, policies and reports against academic
              standards — flagging risks and producing audit-ready insights automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={dest} className="btn-primary px-6 py-3 text-base">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                Sign in
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              {['No credit card required', 'Set up in minutes', 'Free starter plan'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero card mock */}
          <div className="relative animate-fade-in">
            <div className="card overflow-hidden p-0 shadow-card-hover">
              <div className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-ink-500">Compliance Dashboard</span>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'Documents', v: '128' },
                    { l: 'Compliant', v: '92%' },
                    { l: 'Issues', v: '14' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-ink-50 p-3 text-center">
                      <p className="text-2xl font-bold text-ink-900">{s.v}</p>
                      <p className="text-xs text-ink-500">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
                  <p className="text-sm text-brand-100">Average compliance score</p>
                  <p className="text-3xl font-extrabold">92%</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[92%] rounded-full bg-white" />
                  </div>
                </div>
                {[
                  { t: 'CS101 Syllabus 2026', s: 'Compliant', c: 'text-emerald-600' },
                  { t: 'Exam Integrity Policy', s: 'Needs review', c: 'text-amber-600' },
                  { t: 'Accreditation Report Q2', s: 'Compliant', c: 'text-emerald-600' },
                ].map((d) => (
                  <div
                    key={d.t}
                    className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm text-ink-700">
                      <FileCheck2 className="h-4 w-4 text-brand-500" /> {d.t}
                    </span>
                    <span className={`text-xs font-semibold ${d.c}`}>{d.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-ink-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-ink-900">
              Everything you need to stay compliant
            </h2>
            <p className="mt-3 text-ink-600">
              Purpose-built for lecturers, departments and universities.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card p-6 transition hover:shadow-card-hover">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-ink-900">How it works</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { n: '1', t: 'Upload', d: 'Drag & drop your academic documents securely.' },
              { n: '2', t: 'Analyse', d: 'Our AI scores them against compliance rules instantly.' },
              { n: '3', t: 'Act', d: 'Review flagged issues and export audit-ready reports.' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="bg-ink-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold">Ready to get compliant?</h2>
              <p className="mt-3 max-w-md text-ink-300">
                Create your free account today, or reach out and we'll help you onboard your
                institution.
              </p>
              <Link to={dest} className="btn-primary mt-6 px-6 py-3 text-base">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={CONTACT.phoneHref}
                className="rounded-2xl bg-ink-800 p-5 transition hover:bg-ink-700"
              >
                <Phone className="h-6 w-6 text-brand-400" />
                <p className="mt-3 text-sm text-ink-400">Call us</p>
                <p className="font-semibold">{CONTACT.phone}</p>
              </a>
              <a
                href={CONTACT.emailHref}
                className="rounded-2xl bg-ink-800 p-5 transition hover:bg-ink-700"
              >
                <Mail className="h-6 w-6 text-brand-400" />
                <p className="mt-3 text-sm text-ink-400">Email us</p>
                <p className="break-all font-semibold">{CONTACT.email}</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-800 bg-ink-900 py-6 text-center text-sm text-ink-500">
        © {new Date().getFullYear()} ComplyAI · AI-Driven Academic Compliance System
      </footer>
    </div>
  )
}
