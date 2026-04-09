# VocaQuest 🎮📚

> **Gamified K-12 Vocabulary, Articulation & Speaking Confidence Platform**  
> Built with React + Vite + TypeScript + Tailwind + Supabase + Anthropic Claude API

---

## Overview

VocaQuest helps K-12 students improve vocabulary, pronunciation, articulation, and speaking confidence through daily missions, quests, XP rewards, streaks, badges, and speaking challenges.

**Core Product Loop:** `Learn → Speak → Use → Earn → Unlock → Repeat`

### Grade Band Worlds

| World | Grades | Focus |
|-------|--------|-------|
| 🌱 Word Garden | K–2 | Basic vocabulary & phonics |
| 🏙️ Sentence City | 3–5 | Sentence building & context |
| 🎭 Expression Academy | 6–8 | Expressive language & tone |
| 🏟️ Fluency Arena | 9–12 | Advanced articulation & debate |

### User Roles

- **Student** — core game loop, quests, XP, badges
- **Parent** — child progress monitoring, weekly reports
- **Teacher** — classroom management, mission assignment, reports
- **Admin** — platform management, word library, gamification rules

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 11 |
| Routing | React Router v6 |
| State | Zustand + TanStack Query |
| Backend | Supabase (Auth + Postgres + Edge Functions + Realtime) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Audio | Web Speech API + Howler.js |
| Payments | Stripe |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI (`npm install -g supabase`)
- Vercel CLI (`npm install -g vercel`) *(optional)*

### 1. Clone & Install

```bash
git clone https://github.com/your-org/vocaquest.git
cd vocaquest
npm install
```

### 2. Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Anthropic (server-side only — NEVER expose in client code)
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development
```

> ⚠️ **Never expose `ANTHROPIC_API_KEY` in client code.** It must only be used inside Supabase Edge Functions.

### 3. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### 4. Supabase Setup (Local)

```bash
supabase start
supabase db push
```

Apply migrations in order:

```bash
supabase migration up
```

Generate TypeScript types from your schema:

```bash
supabase gen types typescript --local > src/types/supabase.ts
```

---

## Project Structure

```
vocaquest/
├── CLAUDE.md                        ← Claude Code orchestrator (start here)
├── README.md                        ← This file
├── .claude/
│   └── agents/
│       ├── @prd.md                  ← Product requirements agent
│       ├── @schema.md               ← Database schema agent
│       ├── @gamification.md         ← Gamification engine agent
│       ├── @student.md              ← Student experience agent
│       ├── @teacher.md              ← Teacher dashboard agent
│       └── @gtm.md                  ← GTM strategy agent
├── src/
│   ├── app/                         ← App root, providers, router
│   ├── components/
│   │   ├── common/                  ← Shared UI primitives
│   │   ├── layout/                  ← Role-based shell layouts
│   │   ├── gamification/            ← XP, streaks, badges, rewards
│   │   ├── charts/                  ← Data visualizations
│   │   ├── cards/                   ← Word, Quest, Battle cards
│   │   ├── badges/                  ← Badge cabinet + grid
│   │   ├── leaderboards/            ← Leaderboard table + filters
│   │   └── worlds/                  ← World map + nodes
│   ├── pages/
│   │   ├── public/                  ← Landing, Pricing, FAQ
│   │   ├── onboarding/              ← Role selection
│   │   ├── student/                 ← Dashboard, Quest, Battle, etc.
│   │   ├── parent/                  ← Progress, Reports
│   │   ├── teacher/                 ← Classroom, Assignments
│   │   └── admin/                   ← Word library, Gamification rules
│   ├── hooks/                       ← Custom React hooks
│   ├── services/                    ← Supabase + AI service layer
│   ├── store/                       ← Zustand stores
│   ├── data/                        ← Mock data (Phase 1–4)
│   ├── types/                       ← TypeScript types & interfaces
│   ├── utils/                       ← XP math, formatting, dates
│   └── constants/                   ← XP values, levels, routes, worlds
├── supabase/
│   ├── migrations/                  ← 11 ordered SQL migration files
│   ├── functions/                   ← 5 Edge Functions
│   └── seed/                        ← 500 word seed data
└── public/
    └── assets/
```

---

## Claude Code Agent Commands

Run these inside Claude Code to activate specialized sub-agents:

| Command | Purpose |
|---------|---------|
| `@prd` | Product requirements & feature spec questions |
| `@schema` | Database schema, migrations, RLS policies |
| `@gamification` | XP engine, levels, streaks, badges, Boss Battles |
| `@student` | Student UX flows, quest logic, pronunciation |
| `@teacher` | Teacher dashboard, classroom, mission assignment |
| `@gtm` | GTM strategy, pricing, positioning, growth |

---

## Gamification Engine

### XP Values

| Action | XP |
|--------|----|
| Learn a new word | +10 |
| Pronunciation attempt | +5 |
| Correct pronunciation | +15 |
| Complete Sentence Builder | +20 |
| Complete Say It Better | +25 |
| Read aloud full passage | +30 |
| Complete Daily Quest | +50 |
| 7-day streak bonus | +100 |
| Win Boss Battle | +150 |

### Level Thresholds & Titles

| Level | XP Required | Title |
|-------|------------|-------|
| 1 | 0 | Word Explorer |
| 2 | 200 | Sentence Builder |
| 3 | 500 | Clarity Speaker |
| 4 | 1,000 | Vocabulary Ninja |
| 5 | 2,000 | Expression Master |
| 6 | 3,500 | Academic Communicator |
| 7 | 5,500 | Fluent Leader |
| 8 | 8,000 | Elite Orator |

---

## Database Migrations

Apply in this order:

```
001_create_profiles.sql
002_create_schools.sql
003_create_gamification.sql
004_create_words.sql
005_create_quests.sql
006_create_classrooms.sql
007_create_leaderboards.sql
008_create_subscriptions.sql
009_rls_policies.sql
010_triggers_and_functions.sql
011_seed_words.sql
```

---

## Edge Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `process-xp-event` | On XP insert | Awards XP, checks level up, unlocks badges |
| `update-streaks` | Nightly cron | Resets streaks for inactive students |
| `compute-leaderboard` | Weekly cron | Snapshots weekly XP rankings |
| `score-sentence` | Student submit | Claude API sentence quality scoring |
| `stripe-webhook` | Stripe event | Subscription lifecycle management |

---

## Development Phases

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 — Foundation | 1–4 | Scaffold, design system, landing page, public routes |
| 2 — Student Experience | 5–8 | Full gamification loop, quests, XP, badges (mock data) |
| 3 — Parent + Teacher | 9–12 | Supporting role dashboards |
| 4 — Admin + Rules Engine | 13–16 | Word library, gamification configurator, analytics |
| 5 — Real Backend | 17–20 | Supabase integration, real auth, RLS, Stripe |
| 6 — AI Integration | 21–24 | Claude API scoring, Whisper pronunciation, adaptive recs |

---

## Design System

**Colors:**

```css
--color-indigo-primary: #4F46E5   /* Brand primary */
--color-teal-accent:    #0D9488   /* Secondary actions */
--color-amber-xp:       #F59E0B   /* XP, streaks, badges */
--world-word-garden:    #10B981   /* K-2 green */
--world-sentence-city:  #3B82F6   /* 3-5 blue */
--world-expression-academy: #8B5CF6  /* 6-8 purple */
--world-fluency-arena:  #EF4444   /* 9-12 red */
```

**Typography:** Inter (UI) · JetBrains Mono (XP values, phonetics, code)

**Motion:** Framer Motion — spring physics for XP bar, bounce for badge unlocks, fade for page transitions. All animations under 300ms.

---

## Key Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run type-check    # TypeScript check (no emit)
npm run lint          # ESLint

supabase start        # Start local Supabase stack
supabase db push      # Apply migrations
supabase db reset     # Reset + re-seed local DB
supabase functions serve  # Serve Edge Functions locally

vercel --prod         # Deploy to production
```

---

## Compliance

- ✅ **COPPA** — No data collected from children under 13 without parental consent
- ✅ **FERPA** — Student education records handled per federal requirements  
- ✅ **WCAG 2.1 AA** — Accessibility standards for K-12 educational tools

---

## License

Proprietary — All rights reserved © VocaQuest 2026

---

*For questions about the product architecture, run `@prd` or `@schema` inside Claude Code.*
