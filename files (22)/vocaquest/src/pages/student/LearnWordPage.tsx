// src/pages/student/LearnWordPage.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getMockWordById } from '../../data/mockWords';
import WordCard from '../../components/cards/WordCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes.constants';
import XPPopup from '../../components/gamification/XPPopup';
import { useState } from 'react';
import { XP_VALUES } from '../../constants/gamification.constants';

export default function LearnWordPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const [showXP, setShowXP] = useState(false);

  const word = wordId ? getMockWordById(wordId) : undefined;

  if (!word) {
    return (
      <EmptyState
        emoji="🔍"
        title="Word not found"
        description="This word doesn't exist in the current word bank."
      />
    );
  }

  const handleContinue = () => {
    setShowXP(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {showXP && (
        <XPPopup
          amount={XP_VALUES.LEARN_WORD}
          onComplete={() => navigate(ROUTES.STUDENT_PRONOUNCE(word.id))}
        />
      )}

      <div className="max-w-lg mx-auto px-4 pt-10 pb-20">
        {/* Back nav */}
        <button
          onClick={() => navigate(ROUTES.STUDENT_QUEST)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Learn', 'Speak', 'Use'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                i === 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <span>{i + 1}</span>
                <span>{step}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Learn this word</h2>

        {/* Word card */}
        <WordCard word={word} variant="learn" className="mb-6" />

        {/* Memory tip */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-8">
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 Memory tip</p>
          <p className="text-sm text-amber-800">
            Say the word out loud 3 times. Picture the example sentence in your mind.
          </p>
        </div>

        <Button fullWidth size="lg" onClick={handleContinue}>
          I've got it — Next: Pronounce it
        </Button>
      </div>
    </div>
  );
}
