# 🎯 UPSC Mentor

**An AI-powered preparation companion for UPSC Civil Services aspirants — syllabus tracking, Mains answer evaluation, Prelims PYQ drilling, MCQ test series with AI diagnostics, and a personal AI mentor, all in one workspace.**

🔗 **Live App:** [upsc-by-iitian.onrender.com](https://upsc-by-iitian.onrender.com/)

---

## ✨ Overview

UPSC Mentor is a full-stack exam-prep platform built for CSE aspirants. It combines a structured syllabus tracker, a daily study-hours timer with cross-device sync, a multi-provider AI engine for grading Mains answers and chatting with an AI mentor, a Prelims PYQ practice bank organized by subject/topic, an MCQ Test Series module with automated diagnostic reports, and a curated resource library (NCERTs, reference books, video classes, notes) — all wrapped in a single dashboard with an admin control panel.

---

## 🚀 Core Features

### 📊 Dashboard
- **Study Timer** — live stopwatch that persists per day/user and syncs across open tabs/devices in real time via Socket.io.
- **Study Chart** — visual history of daily study hours vs. the user's daily target.
- **Today Planner** — quick add/check-off daily task list.
- **Current Affairs Log** — capture daily current-affairs notes/headlines.
- **Answer Writing Tracker** — log Mains answer-writing practice (question/topic answered) outside the formal evaluator flow.
- **Paper Progress** — at-a-glance completion percentage per GS paper, pulled from the Syllabus Tracker.
- **Streak & Countdown** — daily login streak, longest streak, and a live countdown to the user's configured exam date.

### 📚 Syllabus Tracker
- Full GS Prelims + Mains (GS1–GS4) syllabus broken into papers → modules.
- Per-module status (Pending / In Progress / Revision / Done) with progress bars.
- **Bulk syllabus update** endpoint so multiple modules can be saved in a single request (avoids race conditions from parallel PATCH calls).
- Stage-level coverage bars summarizing how much of Prelims/Mains is complete.

### 🤖 AI Mentor Chat
- Persistent, multi-thread conversational mentor (ChatGPT/Gemini-style chat history), backed by a dedicated system prompt that strictly bans flattery/filler and enforces structured markdown (headings, tables, `:::memory:::` recall blocks, exam tips).
- **Durable memory extraction** — a background process distills long-term facts about the student (recurring weak spots, study patterns) from each conversation turn so future answers are silently calibrated without ever narrating the student's stats back to them.
- Available as both a compact floating chat bubble and a dedicated full-page **AI Mentor Workspace**.
- Quote-of-the-day cards can be sent straight into the mentor chat for instant explanation, historical context, and essay/GS deployment advice.

### ✍️ Mains Grind (Answer Evaluation)
- Submit a Mains-style answer for a chosen GS paper (GS1–GS4, Essay) and receive an AI-graded evaluation: score, score rationale, strengths, weaknesses, a rewritten **topper-style answer**, keyword analysis (present / missing / bonus), structural feedback, and prioritized next actions.
- Paper-specific grading rubrics via dedicated system instructions per paper.
- Rate-limited to protect AI quota (5 evaluations/user/day, admins exempt).

### 📝 Prelims Grind & Topic-wise Practice
- Large bank of Prelims PYQs organized subject-wise (Polity, Economy, History, Modern History, Geography, Environment & Ecology, Art & Culture, Science & Tech, Social Issues, IR/IYP) and CSAT (Comprehension, Maths, Reasoning).
- Topic-wise view groups both Prelims PYQs and Mains PYQs (2024 & 2025, GS1–GS4) by subject for focused, syllabus-aligned revision.
- Per-question attempt tracking, synced to the server for cross-device stats and profile-level analytics.
- **Spaced-repetition queue** — push tough topics into a revision queue with difficulty weighting, surfaced back to the user when due.

### 🧪 Test Series (MCQ)
- Full timed mock-test interface (question palette, timer, review mode) across multiple test series (e.g. SFG 2026) and levels.
- Server-side scoring engine using the exact UPSC marking fraction (+2 / −2/3) computed at full precision — never trusted from the client.
- **AI Diagnostic Report** per attempt: performance band (Needs Work / Average / Good / Excellent), strong & weak topics with accuracy %, a realistic 7-day topic-prioritized study plan, priority actions, and auto-generated spaced-repetition recommendations for the weakest areas.
- Re-analyze any past attempt on demand; rate-limited to 20 AI analyses/user/day.

### 📖 Resource Library
- NCERT book tracker (subject-filterable, with completion state).
- Curated reference books, topper/expert notes, and YouTube class links — organized by subject/paper/module with tag filtering.

### 👤 Profile & Auth
- Email/password registration (with exam-date requirement for the countdown tracker) and **Google OAuth (Google Identity Services)** sign-in.
- JWT-based session auth; profile page for editing target year, daily target hours, exam date, and changing password.

### 🛡️ Admin Panel
- Aggregate metrics (visitor analytics — daily hits, distinct visitors, route breakdown — tracked server-side and hashed for privacy).
- User list view.
- **Feature flag management** — create, update, and delete dynamic "Feature" records (name, description, path, active state) directly from the UI.
- Gated behind `protect` + `adminOnly` middleware on every route.

---

## 🛠️ Tech Stack

### Frontend
- **React** (JSX) + **Vite**
- **Tailwind CSS** — utility-first styling with a custom CSS-variable design system (light/dark theme)
- **lucide-react** — icon set
- **Socket.io-client** — real-time timer/progress sync across tabs and devices
- Custom hooks for state: `useAuth`, `useUserData`, `useAI`, `useQuestionAttempts`, `useRevisionQueue`, `timerStore`
- PWA install prompt (installable app experience)
- Google Identity Services SDK for OAuth

### Backend
- **Node.js + Express**
- **Sequelize ORM** over **PostgreSQL** (SSL-enabled connection, auto-sync on boot)
- **Socket.io** — real-time server for cross-device dashboard/timer sync
- **JWT (jsonwebtoken)** — authentication
- **bcryptjs** — password hashing
- **express-rate-limit** — tiered rate limiting (global, auth, AI-evaluation, test-analysis)
- **CORS** — explicit allow-list (`localhost:5173`, production domain)

### AI Layer (multi-provider fallback chain)
- **Google Gemini** (`gemini-2.5-flash`) — primary provider for chat, Mains evaluation, test analysis, and memory extraction
- **OpenAI** (`gpt-4o`) — fallback provider
- **Anthropic Claude** (`claude-sonnet-4-5`) — fallback provider
- **Groq** (`llama-3.3-70b-versatile`) — fallback provider, with a schema-recovery retry pass
- Each AI task (Mains evaluation, mentor chat, test diagnostics, memory extraction) has its own dedicated system instruction; the client tries every configured provider in order until one succeeds.

### Database
- **PostgreSQL** — tables: `User`, `UserData` (+ related JSONB columns for syllabus progress, answers, daily logs, spaced repetition, mentor chat threads/memory), `Feature`, `VisitorLog`, `TestAttempt`.

---

## 🏗️ System Architecture

```
React (Vite) SPA  ──HTTP (fetch, JWT bearer)──▶  Express API  ──Sequelize──▶  PostgreSQL
        │                                              │
        └──────────── Socket.io (WS) ──────────────────┘
                 (timer + progress live sync)

Express Controllers ──▶ ai-client.js ──▶ Gemini / OpenAI / Claude / Groq
                                              (first available provider wins,
                                               normalized response shape)
```

1. The React SPA holds local UI state and a single source of truth, `userData`, fetched from `GET /api/dashboard` and kept in sync via the `useUserData` hook.
2. Mutating actions (syllabus progress, daily logs, question attempts, spaced repetition) hit dedicated `PATCH`/`POST` routes under `/api/dashboard/*`, each backed by a Sequelize model and persisted to PostgreSQL.
3. The study timer is mirrored across the user's open tabs/devices over a Socket.io connection so progress never gets lost or double-counted.
4. AI-backed features (`/api/evaluate/*`, `/api/tests/submit`, `/api/tests/:id/reanalyze`) build a structured prompt server-side, send it through the provider fallback chain in `ai-client.js`, parse/normalize the JSON response, and persist the result (e.g. `ai_analysis` on `TestAttempt`, `mentor_threads`/`mentor_memory` on `UserData`).
5. Every request is passed through a `VisitorLog` middleware that records hashed-IP hit counts per route per day, surfaced in the Admin Panel.
6. Auth uses JWT bearer tokens issued on register/login/Google-OAuth and validated by `protect` middleware; `adminOnly` middleware additionally gates the Admin routes.

---

## ⚙️ Local Installation & Setup

### Prerequisites
- Node.js (LTS)
- A PostgreSQL database (e.g. local Postgres, Render, Supabase, Neon)
- API keys for at least one AI provider (Gemini recommended as primary)

### 1. Clone & install

```bash
git clone https://github.com/AnandVivek-iiti/upsc.git
cd upsc

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Auth
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GROQ_API_KEY=your-groq-key

# Google OAuth (server-side token verification)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 3. Run in development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

On first boot, the backend connects to PostgreSQL and runs `sequelize.sync({ alter: true })`, automatically creating/updating all tables (`User`, `UserData`, `Feature`, `VisitorLog`, `TestAttempt` and their related models).

### 4. Build for production

```bash
cd client
npm run build
```

Deploy the backend (Express server) and the built frontend (static `dist/`) to your platform of choice — the live deployment runs on [Render](https://upsc-by-iitian.onrender.com/).

---

## 📁 Project Structure (high level)

```
backend/
  src/
    config/        # DB connection, AI client + provider system instructions
    controllers/    # auth, dashboard, evaluate, test, admin logic
    middleware/      # JWT auth, rate limiting, error handling
    models/          # Sequelize models (User, UserData, Feature, VisitorLog, TestAttempt)
    routes/          # Express route tables
    socket/          # Socket.io manager (real-time timer sync)
    server.js

frontend/
  src/
    components/      # Sidebar, BottomNav, Footer, shared UI (QuestionRenderer, MatchTable, AuthGate...)
    pages/            # Dashboard, SyllabusTracker, MainsGrind, PrelimsGrind, Topicwise,
                       # ResourceLibrary, Testseriespage, Adminpannel, ProfilePage, AuthPage,
                       # AI/ (AIMentorChat, AIRevisionPanel, AIEvaluatorPanel)
    hooks/             # useAuth, useUserData, useAI, timerStore, useQuestionAttempts, useRevisionQueue
    data/               # Subject-wise PYQ banks, syllabus data, test-series data, resources
    utils/              # api.js (REST client), socket.js, dateUtils.js
```

---

## 📄 License

Proprietary — © UPSC Mentor. All rights reserved.
