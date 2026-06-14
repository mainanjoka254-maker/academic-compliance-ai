import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { documentsRouter } from './routes/documents.js'
import { dashboardRouter } from './routes/dashboard.js'
import { miscRouter } from './routes/misc.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

const corsOrigin = process.env.CORS_ORIGIN
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(',').map((o) => o.trim()) }
      : undefined,
  ),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'complyai-api', time: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api', miscRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Central error handler (e.g. multer file-size errors).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error'
  const status = message.toLowerCase().includes('file too large') ? 413 : 500
  console.error('[error]', message)
  res.status(status).json({ error: message })
})

app.listen(PORT, () => {
  console.log(`ComplyAI API running on http://localhost:${PORT}`)
})
