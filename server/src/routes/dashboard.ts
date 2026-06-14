import { Router } from 'express'
import { db, type DocumentRow } from '../db.js'
import { requireAuth, type AuthRequest } from '../auth.js'
import { serializeDocument } from '../serialize.js'

export const dashboardRouter = Router()
dashboardRouter.use(requireAuth)

dashboardRouter.get('/', (req: AuthRequest, res) => {
  const rows = db
    .prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at ASC, id ASC')
    .all(req.userId) as DocumentRow[]

  const total = rows.length
  const compliant = rows.filter((r) => r.status === 'compliant').length
  const needsReview = rows.filter((r) => r.status === 'review').length
  const nonCompliant = rows.filter((r) => r.status === 'non_compliant').length

  const averageScore = total
    ? Math.round(rows.reduce((sum, r) => sum + r.compliance_score, 0) / total)
    : 0

  // Score trend: last up to 8 documents in chronological order.
  const trendRows = rows.slice(-8)
  const scoreTrend = trendRows.map((r, i) => ({
    label: trendRows.length > 6 ? `#${i + 1}` : r.title.slice(0, 10),
    score: r.compliance_score,
  }))

  // Category breakdown.
  const categoryMap = new Map<string, number>()
  for (const r of rows) {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + 1)
  }
  const categoryBreakdown = [...categoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const recentDocuments = [...rows]
    .reverse()
    .slice(0, 5)
    .map(serializeDocument)

  res.json({
    totalDocuments: total,
    compliant,
    needsReview,
    nonCompliant,
    averageScore,
    scoreTrend,
    categoryBreakdown,
    recentDocuments,
  })
})
