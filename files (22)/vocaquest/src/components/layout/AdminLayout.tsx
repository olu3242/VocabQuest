// src/components/layout/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';

const nav = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/words',        icon: BookOpen,        label: 'Words'        },
  { to: '/admin/gamification', icon: Settings,        label: 'Rules'        },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20"><Outlet /></main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
