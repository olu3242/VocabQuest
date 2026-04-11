// src/components/layout/PublicLayout.tsx
import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-indigo-600">🎮 VocaQuest</Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link to="/auth" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">Get Started</Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
