# ComplyAI — AI Academic Compliance System (React + PHP)

React + TypeScript + Tailwind **frontend** (`client/`) talking to a **PHP 8.1+ REST API** (`backend/`).
The API implements exactly the endpoints the React app already calls, so the frontend needed no changes.

```
client/                 React + Vite  (http://localhost:5173)
backend/
  public/index.php      front controller + routes   (API on http://127.0.0.1:4000)
  src/Core/             Router, Request, Response, JWT, Auth, Database, Env
  src/Controllers/      Auth, Document, Dashboard, Misc (contact + subscription)
  src/Services/         AIComplianceService (cURL API), TextExtractor, ComplianceAnalyzer
  database/schema.sql   MySQL schema
  bin/migrate.php       creates tables + demo account (SQLite or MySQL)
postman/                Postman collection
```

## Run it

Requirements: **Node 18+**, **PHP 8.1+** (extensions: pdo_sqlite or pdo_mysql, curl, mbstring, zip), Composer.

```bash
# 1. frontend deps
npm install

# 2. backend setup
cd backend
cp .env.example .env          # set JWT_SECRET
composer install              # adds PDF text extraction (smalot/pdfparser)
cd ..
npm run db:migrate            # creates DB + demo user

# 3. start API (:4000) and client (:5173) together
npm run dev
```

Open http://localhost:5173 and sign in with **demo@complyai.io / demo1234**.

### Use MySQL instead of SQLite
In `backend/.env` set `DB_DRIVER=mysql` plus `DB_HOST / DB_NAME / DB_USER / DB_PASS`, then run `npm run db:migrate`
(or import `backend/database/schema.sql` yourself).

### Turn on the real AI / plagiarism check
Set `AI_API_URL` and `AI_API_KEY` in `backend/.env`. The API must accept
`{ text, features }` and return `{ ai_percentage, similarity_percentage, word_count }`.
Thresholds (in `AIComplianceService`): AI > 25 % or similarity > 20 % → non-compliant; > 10 % → needs review.
Without keys, uploads are still scored by the structural rubric in `ComplianceAnalyzer`
(required sections + minimum length).

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | – |
| POST | `/api/auth/register`, `/api/auth/login` | – |
| GET / PATCH | `/api/auth/me` | ✔ |
| GET / POST | `/api/documents` (POST = multipart: `file`, `title`, `category`) | ✔ |
| GET / DELETE | `/api/documents/{id}` | ✔ |
| GET | `/api/dashboard` | ✔ |
| POST | `/api/contact` | optional |
| POST | `/api/subscription` | ✔ |

Auth is `Authorization: Bearer <JWT>` (HS256, 7 days). Import `postman/ComplyAI-PHP.postman_collection.json` to test.

## Notes
- Uploads are stored in `backend/storage/uploads/` (outside the web root). Limit 20 MB — `npm run dev` already passes the PHP limits;
  under XAMPP/Apache raise `upload_max_filesize` / `post_max_size` in `php.ini`.
- On Apache/XAMPP, point the vhost at `backend/public` (the `.htaccess` is included) and set the client's `VITE_API_URL`
  to that URL + `/api`.
- Scanned (image-only) PDFs have no extractable text and fall back to an estimated score.
