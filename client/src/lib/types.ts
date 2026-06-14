export interface User {
  id: number
  name: string
  email: string
  institution: string | null
  role: string
  plan: string
  createdAt: string
}

export type ComplianceStatus = 'compliant' | 'review' | 'non_compliant' | 'pending'

export interface DocumentRecord {
  id: number
  title: string
  category: string
  fileName: string
  fileSize: number
  mimeType: string
  status: ComplianceStatus
  complianceScore: number
  issues: number
  summary: string | null
  createdAt: string
}

export interface DashboardStats {
  totalDocuments: number
  compliant: number
  needsReview: number
  nonCompliant: number
  averageScore: number
  scoreTrend: { label: string; score: number }[]
  categoryBreakdown: { category: string; count: number }[]
  recentDocuments: DocumentRecord[]
}

export interface Plan {
  id: string
  name: string
  price: number
  cadence: string
  tagline: string
  features: string[]
  highlighted?: boolean
}
