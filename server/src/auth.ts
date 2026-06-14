import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db, type UserRow } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me'
const TOKEN_TTL = '7d'

export interface AuthUser {
  id: number
  name: string
  email: string
  institution: string | null
  role: string
  plan: string
  createdAt: string
}

export interface AuthRequest extends Request {
  userId?: number
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    institution: row.institution,
    role: row.role,
    plan: row.plan,
    createdAt: row.created_at,
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string | number }
    const userId = Number(payload.sub)
    if (!userId) return res.status(401).json({ error: 'Invalid session' })
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (!user) return res.status(401).json({ error: 'Invalid session' })
    req.userId = userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
