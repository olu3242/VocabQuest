// src/pages/admin/AdminDashboard.tsx

import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trophy, Settings, TrendingUp, Zap } from 'lucide-react';
import { ROUTES } from '../../constants/routes.constants';

const STATS = [
  { label: 'Total Students', value: '2,841', change: '+142 this week', icon: <Users className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
  { label: 'Words in Library', value: '512',   change: '+20 this month',  icon: <BookOpen className="w-5 h-5 text-teal-500" />,   bg: 'bg-teal-50'   },
  { label: 'Badges Awarded',  value: '18,493', change: '+1,230 this week',icon: <Trophy className="w-5 h-5 text-amber-500" />,   bg: 'bg-amber-50'  },
  { label: 'XP Events Today', value: '94,271', change: 'Real-time',        icon: <Zap className="w-5 h-5 text-purple-500" />,    bg: 'bg-purple-50' },
];

const QUICK_LINKS = [
  { icon: <BookOpen className="w-5 h-5 text-teal-600" />,   label: 'Word Library',        sub: 'Manage vocabulary bank',       route: ROUTES.ADMIN_WORDS          },
  { icon: <Trophy className="w-5 h-5 text-amber-500" />,    label: 'Badge Management',    sub: 'Create & edit badges',         route: ROUTES.ADMIN_BADGES         },
  { icon: <Settings className="w-5 h-5 text-indigo-500" />, label: 'Gamification Rules',  sub: 'XP values, level thresholds',  route: ROUTES.ADMIN_GAMIFICATION   },
  { icon: <Users className="w-5 h-5 text-purple-500" />,    label: 'User Management',     sub: 'Students, teachers, schools',  route: ROUTES.ADMIN_USERS          },
  { icon: <TrendingUp className="w-5 h-5 text-green-500" />,label: 'Analytics',           sub: 'Retention & engagement',       route: ROUTES.ADMIN_ANALYTICS      },
  { icon: <Zap className="w-5 h-5 text-orange-500" />,      label: 'Subscriptions',       sub: 'Plans & billing',              route: ROUTES.ADMIN_SUBSCRIPTIONS  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">{s.icon}<p className="text-xs font-semibold text-gray-600">{s.label}</p></div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.change}</p>
            </div>
          ))}
        </div>
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map(l => (
              <button key={l.label} onClick={() => navigate(l.route)}
                className="bg-white rounded-xl shadow-card p-4 text-left hover:shadow-card-hover transition-shadow">
                <div className="mb-2">{l.icon}</div>
                <p className="font-semibold text-sm text-gray-800">{l.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.sub}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
