// src/constants/routes.constants.ts

export const ROUTES = {
  // Public
  HOME: '/',
  FEATURES: '/features',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  ABOUT: '/about',
  FAQ: '/faq',
  AUTH: '/auth',
  ONBOARDING: '/onboarding',

  // Student
  STUDENT: '/student',
  STUDENT_QUEST: '/student/quest',
  STUDENT_LEARN_WORD: (wordId: string) => `/student/quest/${wordId}/learn`,
  STUDENT_PRONOUNCE: (wordId: string) => `/student/quest/${wordId}/speak`,
  STUDENT_SENTENCE: (wordId: string) => `/student/quest/${wordId}/build`,
  STUDENT_SAY_IT_BETTER: '/student/say-it-better',
  STUDENT_BOSS_BATTLE: '/student/boss-battle',
  STUDENT_ACHIEVEMENTS: '/student/achievements',
  STUDENT_LEADERBOARD: '/student/leaderboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_HANDSHAKES: '/student/handshakes',
  STUDENT_HANDSHAKE_DETAIL: (handshakeId: string) => `/student/handshakes/${handshakeId}`,

  // Parent
  PARENT: '/parent',
  PARENT_CHILD: (childId: string) => `/parent/child/${childId}`,
  PARENT_WEEKLY_REPORT: '/parent/weekly-report',
  PARENT_HOME_PRACTICE: '/parent/home-practice',
  PARENT_SUBSCRIPTION: '/parent/subscription',
  PARENT_HANDSHAKES: '/parent/handshakes',
  PARENT_HANDSHAKE_DETAIL: (handshakeId: string) => `/parent/handshakes/${handshakeId}`,

  // Teacher
  TEACHER: '/teacher',
  TEACHER_CLASSROOM: (id: string) => `/teacher/classroom/${id}`,
  TEACHER_STUDENT: (classId: string, studentId: string) => `/teacher/classroom/${classId}/student/${studentId}`,
  TEACHER_ASSIGN: '/teacher/assign',
  TEACHER_CHALLENGES: '/teacher/challenges',
  TEACHER_LEADERBOARD: '/teacher/leaderboard',
  TEACHER_REPORTS: '/teacher/reports',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_WORDS: '/admin/words',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_GAMIFICATION: '/admin/gamification',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;
