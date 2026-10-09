import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-100 px-4 text-center">
      <div>
        <p className="text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-ink-500">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  )
}
