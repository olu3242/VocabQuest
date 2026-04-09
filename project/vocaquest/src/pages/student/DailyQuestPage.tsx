// src/pages/student/DailyQuestPage.tsx

import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useDailyQuest } from '../../hooks/useDailyQuest';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import { GRADE_BANDS } from '../../constants/worlds.constants';

export default function DailyQuestPage() {
  const navigate = useNavigate();
  const { quest, words, isLoading } = useDailyQuest();

  if (isLoading) return <LoadingSkeleton lines={4} />;

  if (!quest || words.length === 0) {
    return (
      <EmptyState
        emoji="⏳"
        title="No quest assigned yet"
        description="Your teacher hasn't assigned today's words. Check back soon!"
      />
    );
  }

  const isCompleted = quest.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-10 pb-20">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
            Today's Quest
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCompleted ? 'Quest Complete! 🎉' : `${words.length} Words to Master`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isCompleted
              ? 'Come back tomorrow for a new quest.'
              : 'Learn, speak, and use each word to earn XP.'}
          </p>
        </div>

        {/* Word cards */}
        <div className="space-y-3 mb-8">
          {words.map((word, index) => {
            if (!word) return null;
            const done = isCompleted;
            const band = GRADE_BANDS[word.grade_band];

            return (
              <div
                key={word.id}
                className={`bg-white rounded-2xl p-4 shadow-card flex items-center gap-4 ${
                  !done ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''
                }`}
                onClick={() => !done && navigate(ROUTES.STUDENT_LEARN_WORD(word.id))}
              >
                {/* Step number / check */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-teal-100' : 'bg-indigo-50'
                }`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    : <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                  }
                </div>

                {/* Word info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 capitalize">{word.word}</p>
                  <p className="text-xs text-gray-400 font-mono">{word.phonetic}</p>
                </div>

                {/* World badge */}
                <div
                  className="text-xs font-semibold text-white px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: band.color }}
                >
                  {band.emoji}
                </div>

                {!done && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!isCompleted && (
          <Button
            fullWidth
            size="lg"
            onClick={() => words[0] && navigate(ROUTES.STUDENT_LEARN_WORD(words[0].id))}
          >
            Start with "{words[0]?.word}"
          </Button>
        )}

        {isCompleted && (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-lg font-bold text-gray-800">+50 XP earned today!</p>
            <p className="text-sm text-gray-500 mt-1">Keep your streak going tomorrow.</p>
          </div>
        )}
      </div>
    </div>
  );
}
