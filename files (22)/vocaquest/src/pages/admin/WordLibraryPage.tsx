// src/pages/admin/WordLibraryPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { MOCK_WORDS } from '../../data/mockWords';
import Button from '../../components/common/Button';
import { GRADE_BANDS } from '../../constants/worlds.constants';

export default function WordLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState('all');

  const filtered = MOCK_WORDS.filter(w =>
    (bandFilter === 'all' || w.grade_band === bandFilter) &&
    (search === '' || w.word.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Admin
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Word Library</h1>
          <Button size="sm"><Plus className="w-4 h-4" /> Add Word</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all','k2','35','68','912'].map(f => (
            <button key={f} onClick={() => setBandFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bandFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f === 'all' ? 'All' : `${GRADE_BANDS[f as keyof typeof GRADE_BANDS]?.emoji} ${f.toUpperCase()}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words…"
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        </div>

        {/* Word rows */}
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
          {filtered.map(w => {
            const band = GRADE_BANDS[w.grade_band as keyof typeof GRADE_BANDS];
            return (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: band.color }}>{band.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 capitalize">{w.word}</p>
                  <p className="text-xs text-gray-400 truncate">{w.definition}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3].map(d => <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= w.difficulty ? 'bg-indigo-400' : 'bg-gray-200'}`} />)}
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">{filtered.length} words shown</p>
      </div>
    </div>
  );
}
