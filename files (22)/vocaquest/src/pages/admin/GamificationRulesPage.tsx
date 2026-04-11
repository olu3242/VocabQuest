// src/pages/admin/GamificationRulesPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { XP_VALUES, LEVEL_THRESHOLDS, LEVEL_TITLES } from '../../constants/gamification.constants';
import Button from '../../components/common/Button';

export default function GamificationRulesPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Admin
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gamification Rules</h1>

        {/* XP Values */}
        <section className="bg-white rounded-2xl shadow-card p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">XP Values</p>
          <div className="space-y-3">
            {Object.entries(XP_VALUES).map(([action, value]) => (
              <div key={action} className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600 flex-1">{action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                <div className="flex items-center gap-1.5">
                  <input type="number" defaultValue={value} min={0} max={1000}
                    className="w-20 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <span className="text-xs text-gray-400">XP</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Level thresholds */}
        <section className="bg-white rounded-2xl shadow-card p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Level Thresholds</p>
          <div className="space-y-2">
            {LEVEL_THRESHOLDS.map((threshold, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-600 w-16">Level {i + 1}</span>
                <span className="text-xs text-gray-500 flex-1">{LEVEL_TITLES[i]}</span>
                <span className="text-xs font-mono text-gray-700">{threshold.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </section>

        <Button fullWidth size="lg" onClick={handleSave}>
          <Save className="w-4 h-4" /> {saved ? 'Saved! ✓' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
