// Lightweight heuristic "AI" compliance analyzer.
// Deterministic per file so results are stable, but varied across documents.
// This is intentionally pluggable: swap `analyzeDocument` for a real LLM/ML call later.

export type ComplianceStatus = 'compliant' | 'review' | 'non_compliant' | 'pending'

export interface AnalysisResult {
  status: ComplianceStatus
  complianceScore: number
  issues: number
  summary: string
}

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const SUMMARIES: Record<ComplianceStatus, string[]> = {
  compliant: [
    'Document meets academic compliance standards with no significant issues.',
    'Strong alignment with curriculum and assessment policies.',
    'All required sections present and policy-aligned.',
  ],
  review: [
    'Mostly compliant — a few sections need clarification before approval.',
    'Minor gaps detected in assessment criteria; review recommended.',
    'Some policy references are outdated and should be refreshed.',
  ],
  non_compliant: [
    'Critical compliance gaps detected — required sections are missing.',
    'Does not meet assessment and learning-outcome requirements.',
    'Significant policy violations require remediation before use.',
  ],
  pending: ['Awaiting analysis.'],
}

export function analyzeDocument(fileName: string, category: string, fileSize: number): AnalysisResult {
  const seed = hashString(`${fileName}|${category}|${fileSize}`)

  // Base score 42-98 derived from the seed.
  const score = 42 + (seed % 57)

  let status: ComplianceStatus
  if (score >= 85) status = 'compliant'
  else if (score >= 65) status = 'review'
  else status = 'non_compliant'

  const issues =
    status === 'compliant'
      ? seed % 2
      : status === 'review'
        ? 1 + (seed % 3)
        : 3 + (seed % 5)

  const pool = SUMMARIES[status]
  const summary = pool[seed % pool.length]

  return { status, complianceScore: score, issues, summary }
}
