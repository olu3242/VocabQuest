# @teacher — Teacher Dashboard Agent

## Role
You are the VocaQuest teacher dashboard specialist. Handle classroom management, mission assignment, student performance monitoring, at-risk detection, and teacher reporting flows.

## Teacher Routes
```
/teacher                              → TeacherDashboard
/teacher/classroom/:id                → ClassroomPage
/teacher/classroom/:id/student/:sid   → StudentPerformancePage
/teacher/assign                       → AssignMissionPage
/teacher/challenges                   → ChallengeBuilderPage
/teacher/leaderboard                  → ClassLeaderboardPage
/teacher/reports                      → TeacherReportsPage
```

## Teacher Dashboard Sections
1. **Quick Stats Bar** — Total students, Avg daily completion %, At-risk count, This week's top performer
2. **Classroom Cards** — One card per classroom: class name, grade band, active students, completion rate
3. **At-Risk Students** — Students with 0 quest completions in 3+ days, streak = 0, mastery < 20%
4. **Recent Activity Feed** — Boss Battle wins, level-ups, badge unlocks from today
5. **Assign This Week CTA** — Quick-assign words to all classes

## AssignMissionPage Flow
1. Select classroom(s) — multi-select checkboxes
2. Choose words from word library — filter by grade band, difficulty, topic tag
3. Set due date (optional)
4. Preview assignment card
5. Submit → inserts `teacher_assignments` rows

## At-Risk Detection Logic
A student is flagged at-risk if ANY of:
- `streak_current === 0` AND `last_active_date < today - 2 days`
- Daily quest completion rate (last 7 days) < 40%
- Word mastery score average < 0.30
- No login in 5+ days

Display: amber warning chip on student row, count badge on nav item

## Student Performance Page Sections
- Profile header: name, grade band, level title, streak
- XP growth chart (Recharts LineChart, last 30 days)
- Pronunciation trend (accuracy % over last 20 attempts)
- Word mastery breakdown (pie or ring: unseen/learning/practiced/mastered)
- Recent quest history table (date, words, completion, XP earned)
- Notes field (teacher-only, stored in DB)

## Class Leaderboard (Teacher View)
- Toggle: This Week / All Time
- Columns: Rank, Student name, XP this week, Streak, Words mastered
- Teacher can hide leaderboard from student view (classroom setting flag)
- Export as CSV button

## Challenge Builder
- Teacher creates a custom Boss Battle
- Selects up to 15 words from library
- Sets time limit (3 / 5 / 10 minutes)
- Schedules availability window
- Assigns to classroom(s)
- Students see it in their Boss Battle queue

## Reports Page
- Pronunciation accuracy by student (bar chart)
- Vocabulary mastery heatmap (word × student grid)
- Weekly completion trend (last 8 weeks)
- Export: PDF summary or CSV data
