import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'complyai.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    institution TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    plan TEXT NOT NULL DEFAULT 'starter',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    status TEXT NOT NULL,
    compliance_score INTEGER NOT NULL,
    issues INTEGER NOT NULL DEFAULT 0,
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

export interface UserRow {
  id: number
  name: string
  email: string
  password_hash: string
  institution: string | null
  role: string
  plan: string
  created_at: string
}

export interface DocumentRow {
  id: number
  user_id: number
  title: string
  category: string
  file_name: string
  stored_name: string
  file_size: number
  mime_type: string
  status: string
  compliance_score: number
  issues: number
  summary: string | null
  created_at: string
}

// Seed a demo account so the app is usable immediately.
function seedDemo() {
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('demo@complyai.io') as { id: number } | undefined
  if (existing) return

  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, institution, role, plan)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run('Demo Educator', 'demo@complyai.io', hash, 'Demo University', 'admin', 'professional')

  const userId = info.lastInsertRowid as number

  const samples: Array<
    [string, string, string, string, number, number, string]
  > = [
    ['CS101 Syllabus 2026', 'Syllabus', 'compliant', 'application/pdf', 96, 0, 'Meets all curriculum and assessment policy requirements.'],
    ['Exam Integrity Policy', 'Policy Document', 'review', 'application/pdf', 74, 3, 'Plagiarism clause needs clearer enforcement steps.'],
    ['Accreditation Report Q2', 'Accreditation Report', 'compliant', 'application/pdf', 91, 1, 'Strong alignment with accreditation standards.'],
    ['BIO204 Course Outline', 'Course Outline', 'non_compliant', 'application/pdf', 48, 6, 'Missing learning outcomes and assessment weighting.'],
    ['Final Exam - Statistics', 'Exam Paper', 'review', 'application/pdf', 68, 2, 'Some questions exceed the approved syllabus scope.'],
    ['Research Ethics Handbook', 'Policy Document', 'compliant', 'application/pdf', 88, 1, 'Comprehensive and policy-aligned.'],
  ]

  const insert = db.prepare(
    `INSERT INTO documents
      (user_id, title, category, file_name, stored_name, file_size, mime_type, status, compliance_score, issues, summary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
  )

  samples.forEach((s, i) => {
    const [title, category, status, mime, score, issues, summary] = s
    insert.run(
      userId,
      title,
      category,
      `${title}.pdf`,
      `seed-${i}.pdf`,
      120000 + i * 8000,
      mime,
      status,
      score,
      issues,
      summary,
      `-${(samples.length - i) * 4} days`,
    )
  })
}

seedDemo()
