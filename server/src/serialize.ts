import type { DocumentRow } from './db.js'

export function serializeDocument(row: DocumentRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    status: row.status,
    complianceScore: row.compliance_score,
    issues: row.issues,
    summary: row.summary,
    createdAt: row.created_at,
  }
}
