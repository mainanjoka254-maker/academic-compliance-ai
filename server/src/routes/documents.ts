import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, type DocumentRow } from '../db.js'
import { requireAuth, type AuthRequest } from '../auth.js'
import { analyzeDocument } from '../analyzer.js'
import { serializeDocument } from '../serialize.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
})

export const documentsRouter = Router()
documentsRouter.use(requireAuth)

documentsRouter.get('/', (req: AuthRequest, res) => {
  const rows = db
    .prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.userId) as DocumentRow[]
  res.json({ documents: rows.map(serializeDocument) })
})

documentsRouter.post('/', upload.single('file'), (req: AuthRequest, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).json({ error: 'A file is required' })
  }

  const title = (req.body?.title as string)?.trim() || file.originalname
  const category = (req.body?.category as string)?.trim() || 'Other'

  const analysis = analyzeDocument(file.originalname, category, file.size)

  const info = db
    .prepare(
      `INSERT INTO documents
        (user_id, title, category, file_name, stored_name, file_size, mime_type, status, compliance_score, issues, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.userId,
      title,
      category,
      file.originalname,
      file.filename,
      file.size,
      file.mimetype,
      analysis.status,
      analysis.complianceScore,
      analysis.issues,
      analysis.summary,
    )

  const row = db
    .prepare('SELECT * FROM documents WHERE id = ?')
    .get(info.lastInsertRowid) as DocumentRow

  res.status(201).json({ document: serializeDocument(row) })
})

documentsRouter.get('/:id', (req: AuthRequest, res) => {
  const row = db
    .prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as DocumentRow | undefined
  if (!row) return res.status(404).json({ error: 'Document not found' })
  res.json({ document: serializeDocument(row) })
})

documentsRouter.delete('/:id', (req: AuthRequest, res) => {
  const row = db
    .prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId) as DocumentRow | undefined
  if (!row) return res.status(404).json({ error: 'Document not found' })

  db.prepare('DELETE FROM documents WHERE id = ?').run(row.id)

  // Best-effort cleanup of the stored file (seed rows have no real file).
  const filePath = path.join(uploadsDir, row.stored_name)
  fs.promises.unlink(filePath).catch(() => undefined)

  res.json({ ok: true })
})
