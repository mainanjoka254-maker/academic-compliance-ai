import type { ComplianceStatus } from './types'

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const statusMeta: Record<
  ComplianceStatus,
  { label: string; className: string; dot: string }
> = {
  compliant: {
    label: 'Compliant',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  review: {
    label: 'Needs Review',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  non_compliant: {
    label: 'Non-compliant',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-ink-100 text-ink-600',
    dot: 'bg-ink-400',
  },
}
