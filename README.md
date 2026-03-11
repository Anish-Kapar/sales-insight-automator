# 📊 Sales Insight Automator

> **Rabbitt AI — Internal Tool**
> Upload quarterly sales CSV/Excel → AI generates an executive brief → Delivered to your inbox.

---

## 🏗 Architecture Overview

```
┌─────────────────┐       ┌─────────────────────────────────────────────┐
│   Next.js SPA   │──────▶│            FastAPI Backend                  │
│   (Port 3000)   │  POST  │  /api/upload                                │
│                 │  form  │   ├── Middleware: Rate limit + API key auth  │
│  • File upload  │        │   ├── Service: Parse CSV/Excel               │
│  • Email input  │        │   ├── Service: AI Engine (Groq / Gemini)     │
│  • Status UX    │        │   └── Service: SMTP Email delivery           │
└─────────────────┘        └─────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Docker)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sales-insight-automator.git
cd sales-insight-automator
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key (free at console.groq.com) |
| `GEMINI_API_KEY` | Google Gemini API key (fallback) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Gmail **App Password** (not your login password) |
| `API_KEY` | A secret string to protect your API (leave blank for dev) |

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

### 3. Run with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Redoc | http://localhost:8000/redoc |

### 4. Test with the sample file

Upload `sales_q1_2026.csv` from the repo root and enter any valid email.

---

## 🛠 Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env  # fill in values
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

## 🔐 Security Implementation

### 1. API Key Authentication
All `/api/*` endpoints require an `X-API-Key` header matching the `API_KEY` environment variable.
If `API_KEY` is not set, auth is disabled (dev mode only — always set it in production).

```bash
curl -X POST http://localhost:8000/api/upload \
  -H "X-API-Key: your_secret" \
  -F "file=@sales_q1_2026.csv" \
  -F "email=exec@company.com"
```

### 2. Rate Limiting
Powered by `slowapi` — maximum **10 requests/minute per IP**. Returns HTTP 429 when exceeded.

### 3. File Validation
- Only `.csv` and `.xlsx` extensions accepted
- Hard 5MB file size limit (HTTP 413 on breach)
- Content parsed safely with pandas; no eval or exec

### 4. Input Sanitisation
- Email format validated before processing
- File content never executed — only read and converted to string

### 5. CORS
Configured to allow all origins by default. **Lock this down** in production:
```python
allow_origins=["https://your-frontend.vercel.app"]
```

### 6. Non-Root Container
Both Docker images run as non-root users (`appuser`) to reduce attack surface.

### 7. No Secrets in Code
All secrets are loaded from environment variables / `.env`. The `.env` file is `.gitignore`d.

---

## 🚀 Production Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example` in the Render dashboard

### Frontend → Vercel

1. Import your repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
   - `NEXT_PUBLIC_API_KEY` = your API key

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) triggers on every PR to `main`:

| Job | What it does |
|---|---|
| `backend-lint` | Runs `ruff` linter + validates FastAPI app loads |
| `backend-docker` | Builds the backend Docker image |
| `frontend-lint-build` | Runs `next lint` + `next build` |

---

## 📁 Project Structure

```
sales-insight-automator/
├── backend/
│   ├── main.py                  # FastAPI app + middleware
│   ├── routes/upload.py         # POST /api/upload endpoint
│   ├── services/
│   │   ├── parser.py            # CSV/Excel parser
│   │   ├── ai_engine.py         # Groq + Gemini integration
│   │   └── mailer.py            # SMTP email delivery
│   ├── middleware/validation.py # API key guard
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/index.tsx      # SPA entry point
│   │   └── components/
│   │       └── UploadForm.tsx   # Upload UI with drag & drop
│   ├── next.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── .github/workflows/ci.yml     # GitHub Actions
├── docker-compose.yml
├── .env.example
├── sales_q1_2026.csv            # Sample test data
└── README.md
```

---

## 📬 Email Output Sample

The tool sends a formatted HTML email containing a 3-5 paragraph executive summary covering:
- Total revenue and units sold
- Top performing categories and regions  
- Trends, anomalies (cancellations, dips)
- Actionable recommendations

---

*Built for Rabbitt AI · AI Cloud DevOps Engineer Assessment*
