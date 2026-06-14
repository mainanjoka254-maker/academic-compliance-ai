import { Router } from 'express'
import { db, type UserRow } from '../db.js'
import { requireAuth, toAuthUser, type AuthRequest } from '../auth.js'

export const miscRouter = Router()

const VALID_PLANS = new Set(['starter', 'professional', 'institution'])

// Contact form — stored and (in production) forwarded to support.
miscRouter.post('/contact', (req: AuthRequest, res) => {
  const { name, email, subject, message } = req.body ?? {}
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  let userId: number | null = null
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    // Best-effort association; contact is allowed unauthenticated too.
    try {
      const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
        | { id: number }
        | undefined
      userId = row?.id ?? null
    } catch {
      userId = null
    }
  }

  db.prepare(
    `INSERT INTO messages (user_id, name, email, subject, body)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(userId, String(name).trim(), String(email).trim(), String(subject).trim(), String(message).trim())

  res.status(201).json({ ok: true })
})

// Subscription / plan selection.
miscRouter.post('/subscription', requireAuth, (req: AuthRequest, res) => {
  const { plan } = req.body ?? {}
  if (!VALID_PLANS.has(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' })
  }

  db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(plan, req.userId)
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as UserRow
  res.json({ user: toAuthUser(row) })
})
