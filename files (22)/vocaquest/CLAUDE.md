# VocaQuest — CLAUDE.md Orchestrator
> Gamified K-12 Vocabulary, Articulation & Speaking Confidence Platform
> Version: 1.0 | Stack: React + Vite + TypeScript + Tailwind + Supabase + Anthropic
> Last Updated: April 2026

---

## 🎯 PROJECT OVERVIEW

VocaQuest is a production-ready gamification-first K-12 language mastery platform.

**Product Mission:** Help K-12 students improve vocabulary, articulation, pronunciation, speaking confidence, and contextual word usage through daily missions, quests, rewards, streaks, XP, levels, badges, and speaking challenges.

**Core Product Loop:** `Learn → Speak → Use → Earn → Unlock → Repeat`

**Primary Roles:** Student · Parent · Teacher · Admin

**Grade Band Worlds:**
- K-2: Word Garden
- 3-5: Sentence City
- 6-8: Expression Academy
- 9-12: Fluency Arena

---

## 🏗️ TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Components | shadcn/ui component patterns |
| Animation | Framer Motion 11 |
| Routing | React Router v6 |
| State | Zustand + React Query (TanStack) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Supabase (Auth + Postgres + Edge Functions + Realtime + Storage) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Audio | Web Speech API + Howler.js |
| Payments | Stripe |
| Deployment | Vercel |

---

## 📁 FILE STRUCTURE

```
vocaquest/
├── CLAUDE.md                    ← This file
├── .claude/
│   └── agents/
│       ├── @prd.md              ← Product requirements agent
│       ├── @schema.md           ← Database schema agent
│       ├── @gamification.md     ← Gamification engine agent
│       ├── @student.md          ← Student experience agent
│       ├── @teacher.md          ← Teacher dashboard agent
│       └── @gtm.md              ← GTM strategy agent
├── src/
│   ├── app/                     ← App root, providers, global config
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── components/
│   │   ├── common/              ← Shared primitives (Button, Card, Badge, Chip)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StatusChip.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/              ← Shell layouts per role
│   │   │   ├── StudentLayout.tsx
│   │   │   ├── ParentLayout.tsx
│   │   │   ├── TeacherLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── PublicLayout.tsx
│   │   ├── gamification/        ← XP, level, streak, badge components
│   │   │   ├── XPBar.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   ├── StreakFlame.tsx
│   │   │   ├── XPPopup.tsx
│   │   │   ├── BadgeUnlock.tsx
│   │   │   ├── ConfettiEffect.tsx
│   │   │   └── RewardModal.tsx
│   │   ├── charts/
│   │   │   ├── VocabularyGrowth.tsx
│   │   │   ├── PronunciationTrend.tsx
│   │   │   ├── StreakCalendar.tsx
│   │   │   └── ConfidenceRadar.tsx
│   │   ├── cards/
│   │   │   ├── WordCard.tsx
│   │   │   ├── QuestCard.tsx
│   │   │   ├── BossBattleCard.tsx
│   │   │   ├── StudentSummaryCard.tsx
│   │   │   └── ProgressRing.tsx
│   │   ├── badges/
│   │   │   ├── BadgeCabinet.tsx
│   │   │   ├── BadgeItem.tsx
│   │   │   └── BadgeGrid.tsx
│   │   ├── leaderboards/
│   │   │   ├── LeaderboardTable.tsx
│   │   │   ├── LeaderboardRow.tsx
│   │   │   └── LeaderboardFilters.tsx
│   │   └── worlds/
│   │       ├── WorldMap.tsx
│   │       ├── WorldNode.tsx
│   │       └── WorldBanner.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── FeaturesPage.tsx
│   │   │   ├── HowItWorksPage.tsx
│   │   │   ├── PricingPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── FAQPage.tsx
│   │   │   └── AuthPage.tsx
│   │   ├── onboarding/
│   │   │   └── RoleSelectionPage.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── DailyQuestPage.tsx
│   │   │   ├── LearnWordPage.tsx
│   │   │   ├── PronunciationChallengePage.tsx
│   │   │   ├── SentenceBuilderPage.tsx
│   │   │   ├── SayItBetterPage.tsx
│   │   │   ├── BossBattlePage.tsx
│   │   │   ├── AchievementsPage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── parent/
│   │   │   ├── ParentDashboard.tsx
│   │   │   ├── ChildProgressPage.tsx
│   │   │   ├── WeeklyReportPage.tsx
│   │   │   ├── HomePracticePromptsPage.tsx
│   │   │   └── SubscriptionPage.tsx
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── ClassroomPage.tsx
│   │   │   ├── StudentPerformancePage.tsx
│   │   │   ├── AssignMissionPage.tsx
│   │   │   ├── ChallengeBuilderPage.tsx
│   │   │   ├── ClassLeaderboardPage.tsx
│   │   │   └── TeacherReportsPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── UserManagementPage.tsx
│   │       ├── WordLibraryPage.tsx
│   │       ├── BadgeManagementPage.tsx
│   │       ├── GamificationRulesPage.tsx
│   │       ├── SubscriptionPlansPage.tsx
│   │       └── AdminAnalyticsPage.tsx
│   ├── layouts/
│   │   └── (role-based shell wrappers)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useStudentGameState.ts
│   │   ├── useXP.ts
│   │   ├── useStreak.ts
│   │   ├── useBadges.ts
│   │   ├── useLeaderboard.ts
│   │   ├── useDailyQuest.ts
│   │   ├── usePronunciation.ts
│   │   └── useClassroom.ts
│   ├── services/
│   │   ├── supabase.ts          ← Supabase client init
│   │   ├── auth.service.ts
│   │   ├── student.service.ts
│   │   ├── gamification.service.ts
│   │   ├── quest.service.ts
│   │   ├── word.service.ts
│   │   ├── classroom.service.ts
│   │   ├── pronunciation.service.ts  ← AI scoring (mock → real)
│   │   ├── sentence.service.ts       ← Claude sentence scoring
│   │   └── subscription.service.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── gamificationStore.ts
│   │   └── uiStore.ts
│   ├── data/
│   │   ├── mockStudents.ts
│   │   ├── mockWords.ts          ← 50 seeded words across 4 worlds
│   │   ├── mockBadges.ts
│   │   ├── mockLeaderboard.ts
│   │   ├── mockClassrooms.ts
│   │   └── mockBossBattles.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── student.types.ts
│   │   ├── gamification.types.ts
│   │   ├── quest.types.ts
│   │   ├── word.types.ts
│   │   ├── classroom.types.ts
│   │   └── subscription.types.ts
│   ├── utils/
│   │   ├── xp.utils.ts          ← XP calculations, level math
│   │   ├── streak.utils.ts
│   │   ├── date.utils.ts
│   │   └── format.utils.ts
│   └── constants/
│       ├── gamification.constants.ts  ← XP values, level thresholds
│       ├── worlds.constants.ts
│       ├── routes.constants.ts
│       └── badges.constants.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_profiles.sql
│   │   ├── 002_create_schools.sql
│   │   ├── 003_create_gamification.sql
│   │   ├── 004_create_words.sql
│   │   ├── 005_create_quests.sql
│   │   ├── 006_create_classrooms.sql
│   │   ├── 007_create_leaderboards.sql
│   │   ├── 008_create_subscriptions.sql
│   │   ├── 009_rls_policies.sql
│   │   ├── 010_triggers_and_functions.sql
│   │   └── 011_seed_words.sql
│   ├── functions/
│   │   ├── process-xp-event/      ← XP + level + badge engine
│   │   ├── update-streaks/        ← Nightly streak cron
│   │   ├── compute-leaderboard/   ← Weekly leaderboard snapshot
│   │   ├── score-sentence/        ← Claude API sentence scoring
│   │   └── stripe-webhook/        ← Subscription event handler
│   └── seed/
│       └── words.json             ← 500 seed words across all worlds
├── public/
│   └── assets/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎮 GAMIFICATION CONSTANTS

```typescript
// src/constants/gamification.constants.ts

export const XP_VALUES = {
  LEARN_WORD: 10,
  PRONUNCIATION_ATTEMPT: 5,
  CORRECT_PRONUNCIATION: 15,   // Score >= 0.8
  SENTENCE_CREATED: 20,
  SAY_IT_BETTER: 25,
  READING_ALOUD: 30,
  DAILY_QUEST_COMPLETE: 50,
  STREAK_7_DAY: 100,
  BOSS_BATTLE_WIN: 150,
} as const;

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export const LEVEL_TITLES = [
  '',                       // 0 - unused
  'Word Explorer',          // 1
  'Sentence Builder',       // 2
  'Clarity Speaker',        // 3
  'Vocabulary Ninja',       // 4
  'Expression Master',      // 5
  'Academic Communicator',  // 6
  'Fluent Leader',          // 7
  'Elite Orator',           // 8
] as const;

export const GRADE_BANDS = {
  WORD_GARDEN: { label: 'Word Garden', grades: 'K-2', color: '#10B981', icon: '🌱' },
  SENTENCE_CITY: { label: 'Sentence City', grades: '3-5', color: '#3B82F6', icon: '🏙️' },
  EXPRESSION_ACADEMY: { label: 'Expression Academy', grades: '6-8', color: '#8B5CF6', icon: '🎓' },
  FLUENCY_ARENA: { label: 'Fluency Arena', grades: '9-12', color: '#EF4444', icon: '🏆' },
} as const;
```

---

## 🎯 AGENT COMMANDS

| Command | Agent File | Purpose |
|---------|-----------|---------|
| `@prd` | `.claude/agents/@prd.md` | Product requirements, features, scope decisions |
| `@schema` | `.claude/agents/@schema.md` | DB schema, migrations, RLS policies |
| `@gamification` | `.claude/agents/@gamification.md` | XP engine, level logic, badge triggers |
| `@student` | `.claude/agents/@student.md` | Student UX, quest loop, pronunciation flow |
| `@teacher` | `.claude/agents/@teacher.md` | Teacher dashboard, classroom, assignments |
| `@gtm` | `.claude/agents/@gtm.md` | GTM strategy, pricing, positioning |

---

## 🔑 ENVIRONMENT VARIABLES

```bash
# .env.local — NEVER commit to git

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Anthropic (server-side only — use Edge Function, never expose in client)
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...          # Edge Function only
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
VITE_APP_URL=https://vocaquest.app
VITE_APP_ENV=development               # development | staging | production
```

---

## 🛣️ ROUTES REFERENCE

```typescript
// PUBLIC
/                          → LandingPage
/features                  → FeaturesPage
/how-it-works              → HowItWorksPage
/pricing                   → PricingPage
/about                     → AboutPage
/faq                       → FAQPage
/sign-in                   → AuthPage (sign in tab)
/sign-up                   → AuthPage (sign up tab)
/onboarding                → RoleSelectionPage

// STUDENT (protected, role=student)
/student                   → StudentDashboard
/student/quest             → DailyQuestPage
/student/quest/:wordId     → LearnWordPage
/student/pronounce/:wordId → PronunciationChallengePage
/student/sentence/:wordId  → SentenceBuilderPage
/student/say-it-better     → SayItBetterPage
/student/boss-battle       → BossBattlePage
/student/achievements      → AchievementsPage
/student/leaderboard       → LeaderboardPage
/student/profile           → ProfilePage

// PARENT (protected, role=parent)
/parent                    → ParentDashboard
/parent/child/:childId     → ChildProgressPage
/parent/report             → WeeklyReportPage
/parent/prompts            → HomePracticePromptsPage
/parent/subscription       → SubscriptionPage

// TEACHER (protected, role=teacher)
/teacher                   → TeacherDashboard
/teacher/classroom/:id     → ClassroomPage
/teacher/student/:id       → StudentPerformancePage
/teacher/assign            → AssignMissionPage
/teacher/challenge         → ChallengeBuilderPage
/teacher/leaderboard       → ClassLeaderboardPage
/teacher/reports           → TeacherReportsPage

// ADMIN (protected, role=admin)
/admin                     → AdminDashboard
/admin/users               → UserManagementPage
/admin/words               → WordLibraryPage
/admin/badges              → BadgeManagementPage
/admin/rules               → GamificationRulesPage
/admin/plans               → SubscriptionPlansPage
/admin/analytics           → AdminAnalyticsPage
```

---

## 🤖 AI SERVICE PATTERNS

### Sentence Quality Scoring (Claude)

```typescript
// src/services/sentence.service.ts

interface SentenceScoreResult {
  score: number;              // 0.0 - 1.0
  usageAccuracy: number;      // Is word used correctly?
  sentenceComplexity: number; // Grade-appropriate complexity
  clarity: number;            // Clear and readable?
  feedback: string;           // 1-sentence actionable feedback
  xpEarned: number;
}

export async function scoreSentence(
  word: string,
  definition: string,
  gradeBand: string,
  studentSentence: string
): Promise<SentenceScoreResult> {
  // In v1: returns mock async result with realistic data
  // In v2: calls /api/score-sentence Edge Function → Claude API
  
  // Mock v1 pattern:
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
  return {
    score: 0.82,
    usageAccuracy: 0.90,
    sentenceComplexity: 0.75,
    clarity: 0.85,
    feedback: "Great usage! Try adding more context around why you feel that way.",
    xpEarned: 20,
  };
}
```

### Say It Better Scoring (Claude)

```typescript
// src/services/sayItBetter.service.ts

interface SayItBetterResult {
  originalStrength: number;     // Weakness score of original (0-1)
  upgradedStrength: number;     // Strength score of upgrade (0-1)
  vocabularyLevel: number;      // Vocabulary sophistication (0-1)
  tonalMaturity: number;        // Tone/register improvement (0-1)
  suggestions: string[];        // 2-3 alternative upgrade options
  xpEarned: number;
}

// Edge Function system prompt pattern (v2):
const SYSTEM_PROMPT = `
You are VocaQuest's language coach. A K-12 student is upgrading weak language.
Grade band: {gradeBand}
Score the upgrade on:
- vocabularyStrength (0.0-1.0): how much stronger the vocabulary is
- tonalMaturity (0.0-1.0): appropriate improvement for grade level
- clarity (0.0-1.0): still clear and natural
Provide 2 alternative strong upgrades.
Return ONLY valid JSON. No preamble.
`;
```

### Pronunciation Scoring (Web Speech API v1)

```typescript
// src/services/pronunciation.service.ts

interface PronunciationResult {
  recognized: string;          // What speech API heard
  targetWord: string;          // What student was trying to say
  clarity: number;             // 0.0 - 1.0
  syllableAccuracy: number;    // 0.0 - 1.0 (simplified in v1)
  confidence: number;          // Speech API confidence score
  passed: boolean;             // Score >= 0.75
  xpEarned: number;
  feedback: string;
}

// v1: Use Web Speech API SpeechRecognition
// v2: Send audio blob to Supabase Edge Function → Whisper API → structured score
```

---

## 🎨 DESIGN SYSTEM

```css
/* Color Tokens */
--color-indigo-primary: #4F46E5;
--color-indigo-600:     #4338CA;
--color-teal-accent:    #0D9488;
--color-amber-xp:       #F59E0B;     /* XP, badges, streaks */
--color-gold-badge:     #D97706;     /* Badge cabinet */
--color-background:     #F8FAFC;     /* App background */
--color-surface:        #FFFFFF;     /* Card surfaces */
--color-dark-card:      #1E1B4B;    /* Premium game sections */
--color-text-primary:   #1F2937;
--color-text-secondary: #6B7280;
--color-text-muted:     #9CA3AF;

/* Grade World Colors */
--world-word-garden:        #10B981;  /* K-2 */
--world-sentence-city:      #3B82F6;  /* 3-5 */
--world-expression-academy: #8B5CF6;  /* 6-8 */
--world-fluency-arena:      #EF4444;  /* 9-12 */
```

**Typography:** Inter (body, UI) · JetBrains Mono (code, XP values, phonetics)

**Motion Pattern:** Framer Motion — use `spring` physics for XP bar, `bounce` for badge unlocks, `fade` for page transitions. Keep all animations under 300ms for educational context.

**Component Conventions:**
- `variant="primary"` → Indigo filled
- `variant="secondary"` → Teal outlined
- `variant="xp"` → Amber filled (for XP/reward actions)
- `variant="danger"` → Red
- Cards: `rounded-xl shadow-sm` default, `shadow-lg` on hover
- Spacing: 4px base grid, prefer 8/12/16/20/24/32/48px gaps

---

## 📋 DEVELOPMENT PHASES

### Phase 1 — Foundation (Weeks 1-4)
**Goal:** Project scaffold + landing page + design system + public routes

**Deliverables:**
- [ ] Vite + React + TypeScript project init
- [ ] Tailwind + shadcn/ui setup with VocaQuest tokens
- [ ] React Router with role-based protected routes
- [ ] Zustand auth store + mock auth service
- [ ] Landing page (all 10 sections, premium design)
- [ ] All public pages (Features, Pricing, FAQ, How It Works)
- [ ] Auth page (sign in / sign up / role selection)
- [ ] Onboarding role selection page
- [ ] Core reusable components (Button, Card, Badge, Chip, Skeleton, EmptyState)

**Exit criteria:** Landing page pixel-perfect, all public routes navigable, design system documented

### Phase 2 — Student Experience (Weeks 5-8)
**Goal:** Full student gamification loop demo-ready

**Deliverables:**
- [ ] Student Dashboard (all sections, seeded data)
- [ ] Daily Quest flow (3-step completion with XP)
- [ ] Learn Word page (full word detail experience)
- [ ] Pronunciation Challenge (mock Web Speech API)
- [ ] Sentence Builder (text mode, mock AI scoring)
- [ ] Say It Better Challenge (upgrade flow)
- [ ] Weekly Boss Battle (timed UI, completion modal)
- [ ] Achievements / Badge Cabinet
- [ ] Leaderboard (class + weekly views)
- [ ] Profile + Avatar + Unlockables
- [ ] XP animations + level up modal + badge unlock effect
- [ ] World Map progression (4 worlds, node UI)
- [ ] Mock data: 50 words, 3 students, full badge set

**Exit criteria:** Full Daily Quest loop completable, XP fires correctly, streaks tracked

### Phase 3 — Parent + Teacher (Weeks 9-12)
**Goal:** Supporting role dashboards production-quality

**Deliverables:**
- [ ] Parent Dashboard (child overview, weekly summary)
- [ ] Child Progress detail with charts
- [ ] Teacher Dashboard (classroom view, performance)
- [ ] Student at-risk indicators
- [ ] Assign Mission page
- [ ] Class leaderboard controls
- [ ] Reports (pronunciation trend, mastery chart)

### Phase 4 — Admin + Rules Engine (Weeks 13-16)
**Goal:** Operational admin platform

**Deliverables:**
- [ ] Admin Dashboard (metrics, retention, content)
- [ ] Word Library (CRUD, grade-band filters)
- [ ] Badge Management (create, disable, view distribution)
- [ ] Gamification Rules Engine (XP configurator, level thresholds)
- [ ] Subscription Plan management
- [ ] Analytics dashboard (charts, retention, engagement)

### Phase 5 — Real Backend (Weeks 17-20)
**Goal:** Supabase integration, real auth, real data

**Deliverables:**
- [ ] Supabase project setup, all migrations applied
- [ ] Real auth (email/password + Google OAuth)
- [ ] All Supabase service functions connected (replace mocks)
- [ ] RLS policies active and tested
- [ ] DB triggers (XP engine, streak cron)
- [ ] Stripe subscription integration
- [ ] Real word library (500 seed words)

### Phase 6 — AI Integration (Weeks 21-24)
**Goal:** Real Claude API for sentence/pronunciation scoring

**Deliverables:**
- [ ] Supabase Edge Function: score-sentence (Claude claude-sonnet-4-6)
- [ ] Supabase Edge Function: say-it-better (Claude feedback)
- [ ] Pronunciation scoring (Whisper API or Web Speech)
- [ ] Adaptive word recommendations (based on mastery history)
- [ ] AI feedback personalization by grade band

---

## ✅ CODING STANDARDS

```typescript
// Naming
// Components:  PascalCase (StudentDashboard.tsx)
// Hooks:       camelCase with use- prefix (useStudentGameState.ts)
// Services:    camelCase with .service suffix (gamification.service.ts)
// Types:       PascalCase with Type/Interface (StudentProfile, QuestStep)
// Constants:   SCREAMING_SNAKE_CASE (XP_VALUES, LEVEL_THRESHOLDS)

// File patterns
// Every page component is a default export
// Every reusable component is a named export
// Types are co-located in types/ folder, not inline

// State patterns
// Server state: React Query (useQuery, useMutation)
// Client state: Zustand stores
// Form state: React Hook Form
// URL state: React Router useSearchParams

// Mock service pattern (Phase 1-4)
export async function fetchStudentDashboard(studentId: string): Promise<StudentDashboard> {
  // Simulate realistic async latency
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
  // Return typed mock data
  return MOCK_STUDENT_DASHBOARDS[studentId] ?? MOCK_STUDENT_DASHBOARDS.default;
}

// Error handling
// Every service function returns Result<T, Error> or throws typed errors
// Every page has error boundary + graceful fallback
// Every loading state uses LoadingSkeleton component (never raw spinners alone)

// Animation principles
// XP bar fill: spring physics, 600ms
// Badge unlock: scale bounce + particle burst, 800ms total
// Streak flame: pulse loop animation (continuous)
// Page transitions: fade, 200ms
// Reward modal: scale up from center, 300ms
// Confetti: 1.5s burst, auto-dismiss
// NEVER animate elements that have no educational purpose
```

---

## 🚨 IMPORTANT RULES FOR CLAUDE

1. **NEVER rebuild from scratch** — always extend existing architecture
2. **NEVER use unicode bullets** in docx — use LevelFormat.BULLET
3. **ALWAYS preserve existing routes, layouts, and design tokens**
4. **ALWAYS add loading skeletons** — never show blank states without skeleton
5. **ALWAYS add empty states** — never leave dead-end screens
6. **ALWAYS mock services elegantly** — realistic async patterns, typed responses
7. **ALWAYS use reusable components** — never duplicate UI logic across pages
8. **NEVER expose ANTHROPIC_API_KEY** in client code — server/edge function only
9. **ALWAYS check grade band context** before generating word content
10. **ALWAYS keep content school-safe** — COPPA/FERPA compliance in every feature

---

## 📞 QUICK REFERENCE

**Start dev server:** `npm run dev`
**Type check:** `npm run type-check`
**Supabase local:** `supabase start`
**Run migrations:** `supabase db push`
**Generate types:** `supabase gen types typescript --local > src/types/supabase.ts`
**Deploy:** `vercel --prod`

---

*VocaQuest CLAUDE.md v1.0 — Maintained by product team*
*For architecture questions → @arch | For UX decisions → @student | For data model → @schema*
