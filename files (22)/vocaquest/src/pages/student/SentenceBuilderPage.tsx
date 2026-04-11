// src/pages/student/SentenceBuilderPage.tsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { getMockWordById } from '../../data/mockWords';
import { scoreSentenceMock } from '../../services/sentence.service';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import XPPopup from '../../components/gamification/XPPopup';
import { ROUTES } from '../../constants/routes.constants';

export default function SentenceBuilderPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();

  const [sentence, setSentence] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof scoreSentenceMock>> | null>(null);
  const [showXP, setShowXP] = useState(false);

  const word = wordId ? getMockWordById(wordId) : undefined;
  if (!word) return <EmptyState emoji="🔍" title="Word not found" />;

  const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length;
  const minWords = ['k2'].includes(word.grade_band) ? 5 : 8;
  const canSubmit = wordCount >= minWords && !isScoring && !result;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsScoring(true);
    try {
      const scored = await scoreSentenceMock(sentence, word.word);
      setResult(scored);
    } finally {
      setIsScoring(false);
    }
  };

  const handleContinue = () => {
    if (result?.passed) {
      setShowXP(true);
    } else {
      navigate(ROUTES.STUDENT_QUEST);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showXP && (
        <XPPopup
          amount={result?.xpEarned ?? 0}
          onComplete={() => navigate(ROUTES.STUDENT_QUEST)}
        />
      )}

      <div className="max-w-lg mx-auto px-4 pt-10 pb-20">
        <button
          onClick={() => navigate(ROUTES.STUDENT_PRONOUNCE(word.id))}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Learn', 'Speak', 'Use'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                i < 2 ? 'bg-teal-100 text-teal-700'
                : 'bg-indigo-600 text-white'
              }`}>
                <span>{i + 1}</span>
                <span>{step}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-1">Use it in a sentence</h2>
        <p className="text-gray-500 text-sm mb-6">
          Write a sentence using <strong className="text-indigo-600">"{word.word}"</strong>.
          At least {minWords} words.
        </p>

        {/* Word reminder */}
        <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-indigo-400 font-semibold mb-0.5">Definition</p>
          <p className="text-sm text-indigo-800">{word.definition}</p>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <textarea
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            disabled={!!result}
            placeholder={`Write a sentence using "${word.word}"…`}
            rows={4}
            className="w-full rounded-xl border border-gray-200 p-4 text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
          />
          <div className="flex justify-between mt-1 px-1">
            <p className={`text-xs ${wordCount >= minWords ? 'text-teal-600' : 'text-gray-400'}`}>
              {wordCount} / {minWords} words minimum
            </p>
            <p className="text-xs text-gray-300">{sentence.length} chars</p>
          </div>
        </div>

        {/* Score result */}
        {result && (
          <div className={`rounded-2xl p-5 mb-6 ${result.passed ? 'bg-teal-50 border border-teal-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.passed
                ? <CheckCircle className="w-5 h-5 text-teal-600" />
                : <AlertCircle className="w-5 h-5 text-orange-500" />}
              <p className={`font-semibold text-sm ${result.passed ? 'text-teal-700' : 'text-orange-700'}`}>
                {result.passed ? 'Well done!' : 'Good effort!'}
              </p>
            </div>

            {/* Score bars */}
            <div className="space-y-2 mb-3">
              {[
                { label: 'Vocabulary Strength', value: result.vocabularyStrength },
                { label: 'Clarity', value: result.clarity },
                { label: 'Grade Appropriate', value: result.gradeAppropriateness },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{label}</span>
                    <span className="font-mono">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${result.passed ? 'bg-teal-500' : 'bg-orange-400'}`}
                      style={{ width: `${value * 100}%`, transition: 'width 0.7s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600">{result.feedback}</p>
          </div>
        )}

        {/* Buttons */}
        {!result && (
          <Button fullWidth size="lg" loading={isScoring} disabled={!canSubmit} onClick={handleSubmit}>
            {isScoring ? 'Scoring…' : 'Submit Sentence'}
          </Button>
        )}
        {result && (
          <Button fullWidth size="lg" onClick={handleContinue}>
            {result.passed ? `Collect +${result.xpEarned} XP →` : 'Back to Quest'}
          </Button>
        )}
        {result && !result.passed && (
          <Button variant="ghost" fullWidth className="mt-2" onClick={() => { setResult(null); setSentence(''); }}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
