import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, type UserRow } from '../db.js'
import {
  requireAuth,
  signToken,
  toAuthUser,
  type AuthRequest,
} from '../auth.js'

export const authRouter = Router()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

authRouter.post('/register', (req, res) => {
  const { name, email, password, institution } = req.body ?? {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' })
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const hash = bcrypt.hashSync(String(password), 10)
  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, institution)
       VALUES (?, ?, ?, ?)`,
    )
    .run(String(name).trim(), String(email).toLowerCase().trim(), hash, institution ?? null)

  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(info.lastInsertRowid) as UserRow

  const token = signToken(row.id)
  res.status(201).json({ token, user: toAuthUser(row) })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(String(email).toLowerCase().trim()) as UserRow | undefined

  if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = signToken(row.id)
  res.json({ token, user: toAuthUser(row) })
})

authRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as UserRow
  res.json({ user: toAuthUser(row) })
})

authRouter.patch('/me', requireAuth, (req: AuthRequest, res) => {
  const { name, institution } = req.body ?? {}
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as UserRow

  db.prepare('UPDATE users SET name = ?, institution = ? WHERE id = ?').run(
    name ? String(name).trim() : current.name,
    institution !== undefined ? institution : current.institution,
    req.userId,
  )

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as UserRow
  res.json({ user: toAuthUser(row) })
})
