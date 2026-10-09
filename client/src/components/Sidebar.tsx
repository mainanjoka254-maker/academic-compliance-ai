import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileCheck2,
  UploadCloud,
  CreditCard,
  Phone,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/documents', label: 'Documents', icon: FileCheck2 },
  { to: '/app/upload', label: 'Upload', icon: UploadCloud },
  { to: '/app/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/app/contact', label: 'Contact', icon: Phone },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-ink-900 text-ink-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/40">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold leading-tight text-white">ComplyAI</p>
              <p className="text-xs text-ink-400">Academic Compliance</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <p className="text-sm font-semibold">
            {user?.plan && user.plan !== 'free' ? 'Pro workspace' : 'Upgrade your plan'}
          </p>
          <p className="mt-1 text-xs text-brand-100">
            Unlock unlimited AI compliance scans and audit exports.
          </p>
          <NavLink
            to="/app/subscription"
            onClick={onClose}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-white"
          >
            View plans
          </NavLink>
        </div>
      </aside>
    </>
  )
}
