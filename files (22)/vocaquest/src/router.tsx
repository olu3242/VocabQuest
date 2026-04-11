import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import ResetPassword from './modules/auth/ResetPassword';
import Dashboard from './modules/progress/Dashboard';
import AdminDashboard from './modules/admin/AdminDashboard';
import Quiz from './modules/quiz/Quiz';
import Leaderboard from './modules/leaderboard/Leaderboard';
import Upgrade from './modules/premium/Upgrade';
import LandingPage from './pages/public/LandingPage';
import ParentHandshakesPage from './pages/parent/ParentHandshakesPage';
import ParentHandshakeDetailPage from './pages/parent/ParentHandshakeDetailPage';
import StudentHandshakeHubPage from './pages/student/StudentHandshakeHubPage';
import StudentHandshakeDetailPage from './pages/student/StudentHandshakeDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <GuestRoute>
        <Signup />
      </GuestRoute>
    ),
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quiz',
    element: (
      <ProtectedRoute>
        <Quiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <ProtectedRoute>
        <Leaderboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/upgrade',
    element: (
      <ProtectedRoute>
        <Upgrade />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent/handshakes',
    element: (
      <ProtectedRoute>
        <ParentHandshakesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent/handshakes/:handshakeId',
    element: (
      <ProtectedRoute>
        <ParentHandshakeDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/handshakes',
    element: (
      <ProtectedRoute>
        <StudentHandshakeHubPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/handshakes/:handshakeId',
    element: (
      <ProtectedRoute>
        <StudentHandshakeDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);