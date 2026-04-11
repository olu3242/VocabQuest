// src/pages/student/SayItBetterPage.tsx

import { useState } from 'react';
import { ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { scoreSayItBetterMock } from '../../services/sentence.service';
import { GradeBand } from '../../constants/worlds.constants';
import Button from '../../components/common/Button';
import XPPopup from '../../components/gamification/XPPopup';
import { XP_VALUES } from '../../constants/gamification.constants';

const SAMPLES: Record<string, { weak: string; word: string }[]> = {
  k2:   [{ weak: 'The dog was nice.',                word: 'gentle'     }, { weak: 'She helped the kid.',         word: 'helpful'   }],
  '35': [{ weak: 'The team did not give up.',        word: 'resilient'  }, { weak: 'They worked on it together.', word: 'collaborate'}],
  '68': [{ weak: 'The instructions were confusing.', word: 'ambiguous'  }, { weak: 'She understood how he felt.', word: 'empathize' }],
  '912':[{ weak: 'He avoided giving a clear answer.',word: 'equivocate' }, { weak: 'The author put the two ideas next to each other.', word: 'juxtapose'}],
};

export default function SayItBetterPage() {
  const { user } = useAuthStore();
  const gradeBand = (user?.grade_band ?? '35') as GradeBand;
  const samples = SAMPLES[gradeBand] ?? SAMPLES['35'];
  const [idx, setIdx] = useState(0);
  const sample = samples[idx % samples.length];
  const [improved, setImproved] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scoreSayItBetterMock>> | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [done, setDone] = useState(0);

  const wordCount = improved.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 5 && !isScoring && !result;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsScoring(true);
    try { setResult(await scoreSayItBetterMock(improved, sample.word)); }
    finally { setIsScoring(false); }
  };

  const handleNext = () => setShowXP(true);

  const handleReset = () => {
    setResult(null); setImproved(''); setIdx(i => i + 1); setDone(c => c + 1); setShowXP(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {showXP && <XPPopup amount={XP_VALUES.SAY_IT_BETTER} onComplete={handleReset} />}
      <div className="max-w-lg mx-auto px-4 pt-10">
        <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-1">Say It Better</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Upgrade the sentence</h1>
        <p className="text-gray-500 text-sm mb-5">Rewrite the weak sentence using the target word more effectively.</p>
        {done > 0 && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full mb-4 inline-block">🔥 {done} upgraded today</span>}

        <div className="bg-indigo-600 text-white rounded-2xl px-5 py-4 mb-4">
          <p className="text-xs font-semibold opacity-70 mb-1">Target word</p>
          <p className="text-2xl font-bold capitalize">{sample.word}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Weak sentence</p>
          <p className="text-gray-700 italic">"{sample.weak}"</p>
          <p className="text-xs text-orange-500 mt-2">⚠️ Doesn't use "{sample.word}" — too vague</p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {!result && (
          <div className="mb-5">
            <textarea value={improved} onChange={e => setImproved(e.target.value)}
              placeholder={`Rewrite using "${sample.word}"…`} rows={3}
              className="w-full rounded-xl border border-gray-200 p-4 text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className={`text-xs mt-1 px-1 ${wordCount >= 5 ? 'text-teal-600' : 'text-gray-400'}`}>{wordCount} / 5 words minimum</p>
          </div>
        )}

        {result && (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <p className="font-semibold text-teal-700">Great upgrade!</p>
                <span className="ml-auto text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">+{result.xpEarned} XP</span>
              </div>
              {[['Vocabulary Strength', result.vocabularyStrength], ['Tonal Maturity', result.tonalMaturity], ['Clarity', result.clarity]].map(([l, v]) => (
                <div key={String(l)} className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>{l}</span><span className="font-mono">{Math.round(Number(v) * 100)}%</span></div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-teal-500" style={{ width: `${Number(v)*100}%`, transition: 'width 0.7s' }} /></div>
                </div>
              ))}
              <p className="text-sm text-gray-600 mt-3 mb-4">{result.feedback}</p>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expert alternatives</p></div>
                {result.alternatives.map((alt, i) => <p key={i} className="text-sm text-gray-700 italic border-l-2 border-indigo-200 pl-3 mb-1">"{alt}"</p>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4 mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Before vs After</p>
              <div className="bg-red-50 rounded-lg px-3 py-2 mb-2"><p className="text-xs text-red-400 mb-1">Before</p><p className="text-sm text-gray-600 italic">"{sample.weak}"</p></div>
              <div className="bg-teal-50 rounded-lg px-3 py-2"><p className="text-xs text-teal-500 mb-1">Your version</p><p className="text-sm text-gray-700 italic">"{improved}"</p></div>
            </div>
          </>
        )}

        {!result
          ? <Button fullWidth size="lg" loading={isScoring} disabled={!canSubmit} onClick={handleSubmit}>{isScoring ? 'Scoring…' : 'Submit Improvement'}</Button>
          : <Button fullWidth size="lg" onClick={handleNext}>Collect +{result.xpEarned} XP · Next sentence →</Button>
        }
      </div>
    </div>
  );
}
