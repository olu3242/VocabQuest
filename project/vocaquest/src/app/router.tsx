import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Lazy-load pages ──────────────────────────────────────────────────────────

// Public
const LandingPage        = lazy(() => import('../pages/public/LandingPage'));
const PricingPage        = lazy(() => import('../pages/public/PricingPage'));
const AuthPage           = lazy(() => import('../pages/public/AuthPage'));
const OnboardingPage     = lazy(() => import('../pages/onboarding/RoleSelectionPage'));

// Student
const StudentDashboard        = lazy(() => import('../pages/student/StudentDashboard'));
const DailyQuestPage          = lazy(() => import('../pages/student/DailyQuestPage'));
const LearnWordPage           = lazy(() => import('../pages/student/LearnWordPage'));
const PronunciationPage       = lazy(() => import('../pages/student/PronunciationChallengePage'));
const SentenceBuilderPage     = lazy(() => import('../pages/student/SentenceBuilderPage'));
const SayItBetterPage         = lazy(() => import('../pages/student/SayItBetterPage'));
const BossBattlePage          = lazy(() => import('../pages/student/BossBattlePage'));
const AchievementsPage        = lazy(() => import('../pages/student/AchievementsPage'));
const LeaderboardPage         = lazy(() => import('../pages/student/LeaderboardPage'));
const StudentProfilePage      = lazy(() => import('../pages/student/ProfilePage'));

// Parent
const ParentDashboard         = lazy(() => import('../pages/parent/ParentDashboard'));
const ChildProgressPage       = lazy(() => import('../pages/parent/ChildProgressPage'));
const SubscriptionPage        = lazy(() => import('../pages/parent/SubscriptionPage'));

// Teacher
const TeacherDashboard        = lazy(() => import('../pages/teacher/TeacherDashboard'));
const ClassroomPage           = lazy(() => import('../pages/teacher/ClassroomPage'));
const StudentPerformancePage  = lazy(() => import('../pages/teacher/StudentPerformancePage'));
const AssignMissionPage       = lazy(() => import('../pages/teacher/AssignMissionPage'));
const TeacherReportsPage      = lazy(() => import('../pages/teacher/TeacherReportsPage'));

// Admin
const AdminDashboard          = lazy(() => import('../pages/admin/AdminDashboard'));
const WordLibraryPage         = lazy(() => import('../pages/admin/WordLibraryPage'));
const GamificationRulesPage   = lazy(() => import('../pages/admin/GamificationRulesPage'));

// ─── Route guard ──────────────────────────────────────────────────────────────

function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function wrap(element: React.ReactNode) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {element}
    </Suspense>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public
  { path: '/',               element: wrap(<LandingPage />) },
  { path: '/pricing',        element: wrap(<PricingPage />) },
  { path: '/auth',           element: wrap(<AuthPage />) },
  { path: '/onboarding',     element: wrap(<OnboardingPage />) },

  // Student
  {
    path: '/student',
    element: <RequireAuth role="student">{wrap(<StudentDashboard />)}</RequireAuth>,
  },
  {
    path: '/student/quest',
    element: <RequireAuth role="student">{wrap(<DailyQuestPage />)}</RequireAuth>,
  },
  {
    path: '/student/quest/:wordId/learn',
    element: <RequireAuth role="student">{wrap(<LearnWordPage />)}</RequireAuth>,
  },
  {
    path: '/student/quest/:wordId/speak',
    element: <RequireAuth role="student">{wrap(<PronunciationPage />)}</RequireAuth>,
  },
  {
    path: '/student/quest/:wordId/build',
    element: <RequireAuth role="student">{wrap(<SentenceBuilderPage />)}</RequireAuth>,
  },
  {
    path: '/student/say-it-better',
    element: <RequireAuth role="student">{wrap(<SayItBetterPage />)}</RequireAuth>,
  },
  {
    path: '/student/boss-battle',
    element: <RequireAuth role="student">{wrap(<BossBattlePage />)}</RequireAuth>,
  },
  {
    path: '/student/achievements',
    element: <RequireAuth role="student">{wrap(<AchievementsPage />)}</RequireAuth>,
  },
  {
    path: '/student/leaderboard',
    element: <RequireAuth role="student">{wrap(<LeaderboardPage />)}</RequireAuth>,
  },
  {
    path: '/student/profile',
    element: <RequireAuth role="student">{wrap(<StudentProfilePage />)}</RequireAuth>,
  },

  // Parent
  {
    path: '/parent',
    element: <RequireAuth role="parent">{wrap(<ParentDashboard />)}</RequireAuth>,
  },
  {
    path: '/parent/child/:childId',
    element: <RequireAuth role="parent">{wrap(<ChildProgressPage />)}</RequireAuth>,
  },
  {
    path: '/parent/subscription',
    element: <RequireAuth role="parent">{wrap(<SubscriptionPage />)}</RequireAuth>,
  },

  // Teacher
  {
    path: '/teacher',
    element: <RequireAuth role="teacher">{wrap(<TeacherDashboard />)}</RequireAuth>,
  },
  {
    path: '/teacher/classroom/:id',
    element: <RequireAuth role="teacher">{wrap(<ClassroomPage />)}</RequireAuth>,
  },
  {
    path: '/teacher/classroom/:classId/student/:studentId',
    element: <RequireAuth role="teacher">{wrap(<StudentPerformancePage />)}</RequireAuth>,
  },
  {
    path: '/teacher/assign',
    element: <RequireAuth role="teacher">{wrap(<AssignMissionPage />)}</RequireAuth>,
  },
  {
    path: '/teacher/reports',
    element: <RequireAuth role="teacher">{wrap(<TeacherReportsPage />)}</RequireAuth>,
  },

  // Admin
  {
    path: '/admin',
    element: <RequireAuth role="admin">{wrap(<AdminDashboard />)}</RequireAuth>,
  },
  {
    path: '/admin/words',
    element: <RequireAuth role="admin">{wrap(<WordLibraryPage />)}</RequireAuth>,
  },
  {
    path: '/admin/gamification',
    element: <RequireAuth role="admin">{wrap(<GamificationRulesPage />)}</RequireAuth>,
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
