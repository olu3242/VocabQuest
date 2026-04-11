// src/pages/teacher/AssignMissionPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Search } from 'lucide-react';
import { MOCK_WORDS } from '../../data/mockWords';
import Button from '../../components/common/Button';
import { Word } from '../../types/student.types';

const MOCK_CLASSROOMS = [
  { id: 'cls1', name: 'Period 2 — Reading',    grade_band: '35'  },
  { id: 'cls2', name: 'Period 4 — Vocabulary', grade_band: '68'  },
  { id: 'cls3', name: 'Period 6 — Advanced',   grade_band: '912' },
];

export default function AssignMissionPage() {
  const navigate = useNavigate();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedWords, setSelectedWords]     = useState<string[]>([]);
  const [dueDate, setDueDate]                 = useState('');
  const [search, setSearch]                   = useState('');
  const [bandFilter, setBandFilter]           = useState('all');
  const [submitted, setSubmitted]             = useState(false);

  const toggleClass = (id: string) =>
    setSelectedClasses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const toggleWord = (id: string) =>
    setSelectedWords(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const filteredWords = MOCK_WORDS.filter(w =>
    (bandFilter === 'all' || w.grade_band === bandFilter) &&
    (search === '' || w.word.toLowerCase().includes(search.toLowerCase()))
  );

  const canSubmit = selectedClasses.length > 0 && selectedWords.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => navigate('/teacher'), 2000);
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Assignment Sent!</h2>
        <p className="text-gray-500">Words assigned to {selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''}.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <button onClick={() => navigate('/teacher')} className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Assign Words</h1>

        {/* Step 1: Select classrooms */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">1. Select classrooms</p>
          <div className="space-y-2">
            {MOCK_CLASSROOMS.map(cls => {
              const sel = selectedClasses.includes(cls.id);
              return (
                <button key={cls.id} onClick={() => toggleClass(cls.id)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${sel ? 'bg-indigo-600' : 'border-2 border-gray-300'}`}>
                    {sel && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{cls.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{cls.grade_band.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Select words */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">2. Choose words ({selectedWords.length} selected)</p>
          {/* Filters */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {['all','k2','35','68','912'].map(f => (
              <button key={f} onClick={() => setBandFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${bandFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
            <div className="flex items-center gap-1.5 flex-1 min-w-[140px] bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words…"
                className="text-xs flex-1 outline-none text-gray-700 placeholder-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredWords.map((w: Word) => {
              const sel = selectedWords.includes(w.id);
              return (
                <button key={w.id} onClick={() => toggleWord(w.id)}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-all ${sel ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
                  <p className="font-semibold text-sm text-gray-800 capitalize">{w.word}</p>
                  <p className="text-xs text-gray-400 truncate">{w.definition}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Due date */}
        <section className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-2">3. Due date (optional)</p>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </section>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSubmit}>
              Assign {selectedWords.length} word{selectedWords.length !== 1 ? 's' : ''} to {selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
