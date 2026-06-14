import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenu: () => void
}

export function Header({ title, subtitle, onMenu }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
        <button
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="truncate text-sm text-ink-500">{subtitle}</p>}
        </div>

        <div className="hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input w-64 pl-9"
              placeholder="Search documents..."
              aria-label="Search"
            />
          </div>
        </div>

        <button
          className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-ink-100"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-ink-800">{user?.name}</span>
              <span className="block text-xs text-ink-500">{user?.institution ?? user?.email}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-card-hover">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/app/settings')
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
                >
                  Account settings
                </button>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
