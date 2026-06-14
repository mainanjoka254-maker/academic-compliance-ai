# ComplyAI — AI-Driven Academic Compliance System

A full-stack platform that lets institutions upload academic documents (syllabi, exams,
policies, accreditation reports) and instantly score them against compliance rules with an
AI analysis engine. Includes authentication, real data persistence, file uploads, dashboards,
a creative subscription/billing experience, and a contact section.

Built with **React + TypeScript + Tailwind CSS** (client) and **Node.js + Express + SQLite**
(server). The layout (sidebar + header) is implemented in
[`client/src/components/Layout.tsx`](client/src/components/Layout.tsx).

## Features

- **Authentication** — register, sign in, JWT sessions, protected routes, profile settings.
- **Document uploads** — drag & drop, real multipart upload, stored on disk, metadata in SQLite.
- **AI compliance engine** — every upload is scored, classified, and summarised
  ([`server/src/analyzer.ts`](server/src/analyzer.ts) — pluggable for a real LLM later).
- **Live dashboard** — totals, average score trend, category breakdown, recent documents
  (charts via Recharts).
- **Subscription** — creative, professional pricing page with monthly/yearly billing toggle.
- **Contact** — working contact form (persisted) with phone `0140844495` and email
  `mainanjoka254@gmail.com`.
- **Responsive design** — collapsible sidebar, mobile-friendly layouts, clean indigo theme.

## Project structure

```
ai-academic-compliance-system/
├── client/                 # React + TS + Tailwind (Vite)
│   └── src/
│       ├── components/      # Layout, Sidebar, Header, AuthShell, ui/
│       ├── context/         # AuthContext
│       ├── lib/             # api client, types, constants, formatters
│       └── pages/           # Landing, Login, Register, Dashboard, Documents,
│                            # Upload, Subscription, Contact, Settings, NotFound
└── server/                 # Express + better-sqlite3 API
    └── src/
        ├── routes/          # auth, documents, dashboard, misc (contact/subscription)
        ├── analyzer.ts      # compliance scoring engine
        ├── auth.ts          # JWT middleware
        └── db.ts            # SQLite schema + demo seed
```

## Getting started

Requires Node.js 18+.

```bash
# install all workspaces
npm install

# configure the server (optional but recommended)
cp server/.env.example server/.env   # set JWT_SECRET

# run client + server together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000 (the Vite dev server proxies `/api` to it)

### Demo account

A demo account is seeded automatically with sample documents:

- **Email:** `demo@complyai.io`
- **Password:** `demo1234`

Or click **"Try the live demo account"** on the login page.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run client + server concurrently |
| `npm run build` | Build server (tsc) and client (vite) |
| `npm run lint` | Lint the client |
| `npm start` | Start the built server |

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Current user |
| `PATCH` | `/api/auth/me` | Update profile |
| `GET` | `/api/documents` | List documents |
| `POST` | `/api/documents` | Upload + analyse a document |
| `DELETE` | `/api/documents/:id` | Delete a document |
| `GET` | `/api/dashboard` | Aggregated stats |
| `POST` | `/api/subscription` | Change plan |
| `POST` | `/api/contact` | Submit a contact message |

## Replacing the AI engine

`server/src/analyzer.ts` exposes a single `analyzeDocument()` function returning a status,
score, issue count, and summary. Swap its body for a call to your preferred LLM / ML service
to plug in real document understanding — the rest of the app stays unchanged.
