import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/app/dashboard': {
    title: 'Compliance Dashboard',
    subtitle: 'Real-time overview of your institution’s academic compliance.',
  },
  '/app/documents': {
    title: 'Documents',
    subtitle: 'Browse, filter, and manage every analysed document.',
  },
  '/app/upload': {
    title: 'Upload & Analyse',
    subtitle: 'Submit documents for instant AI compliance checks.',
  },
  '/app/subscription': {
    title: 'Subscription & Billing',
    subtitle: 'Choose the plan that scales with your institution.',
  },
  '/app/contact': {
    title: 'Contact & Support',
    subtitle: 'We’re here to help you stay compliant.',
  },
  '/app/settings': {
    title: 'Account Settings',
    subtitle: 'Manage your profile and workspace preferences.',
  },
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = pageMeta[pathname] ?? {
    title: 'ComplyAI',
    subtitle: 'AI-driven academic compliance.',
  }

  return (
    <div className="flex h-full bg-ink-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenu={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
