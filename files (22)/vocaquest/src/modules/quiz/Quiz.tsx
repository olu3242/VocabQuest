import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getQuizOptions,
  getWordById,
  getRandomWord,
  submitAnswer,
  type QuizWord,
} from '../../services/quizService';
import { isPremium } from '../../services/subscriptionService';
import { useAdaptiveLearning } from '../../hooks/useAdaptiveLearning';

export default function Quiz() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [word, setWord] = useState<QuizWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [xpMessage, setXpMessage] = useState('');
  const [streak, setStreak] = useState<number>(0);
  const [sessionXP, setSessionXP] = useState<number>(0);
  const [premiumUser, setPremiumUser] = useState(false);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'positive' | 'negative' | null>(null);

  const {
    accuracy,
    difficulty,
    weakWords,
    strongWords,
    attemptedWordIds,
    recordAnswer,
    refresh: refreshAdaptive,
  } = useAdaptiveLearning(user?.id);

  const difficultyBadgeClass =
    difficulty === 'easy'
      ? 'bg-emerald-100 text-emerald-700'
      : difficulty === 'hard'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';

  const answerClass = useMemo(() => {
    if (!message) return '';
    return message.startsWith('Correct') ? 'bg-emerald-50' : 'bg-red-50';
  }, [message]);

  const weakWordIds = useMemo(() => weakWords.map((item) => item.word_id), [weakWords]);
  const strongWordIds = useMemo(() => strongWords.map((item) => item.word_id), [strongWords]);

  const pickWordByPriority = async (): Promise<QuizWord | null> => {
    const weakCandidateIds = weakWordIds.slice(0, 5);
    for (const id of weakCandidateIds) {
      const candidate = await getWordById(id);
      if (candidate) return candidate;
    }

    const newWord = await getRandomWord({
      difficulty,
      excludeWordIds: attemptedWordIds,
    });
    if (newWord) return newWord;

    const strongCandidateIds = strongWordIds.slice(0, 5);
    for (const id of strongCandidateIds) {
      const candidate = await getWordById(id);
      if (candidate) return candidate;
    }

    return await getRandomWord({ difficulty });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setQuestionLoading(true);
        setLoadError('');
        const userPremium = await isPremium(user.id);
        setPremiumUser(userPremium);

        const randomWord = await pickWordByPriority();
        setWord(randomWord);

        if (!randomWord) {
          setOptions([]);
          return;
        }

        const isWordPremium = randomWord.vocab_packs?.is_premium ?? false;
        const isLocked = isWordPremium && !userPremium;
        setLocked(isLocked);

        if (isLocked) {
          setOptions([]);
          return;
        }

        const nextOptions = await getQuizOptions(randomWord.id, randomWord.definition);
        setOptions(nextOptions);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to load quiz right now.');
      } finally {
        setQuestionLoading(false);
      }
    };

    void load();
  }, [user, difficulty, weakWordIds.join(','), strongWordIds.join(','), attemptedWordIds.join(',')]);

  const handleAnswer = async (option: string) => {
    if (!user || !word || submitting || locked) return;
    setSubmitting(true);

    try {
      const isCorrect = option === word.definition;
      const result = await submitAnswer(user.id, word.id, isCorrect);
      setMessage(isCorrect ? 'Correct!' : 'Wrong!');
      setXpMessage(
        isCorrect
          ? `+${result.xpGained} XP · Keep going!`
          : `+${result.xpGained} XP · Let's review this word`
      );
      setStreak(result.streak);
      setSessionXP((prev) => prev + result.xpGained);
      setFeedbackTone(isCorrect ? 'positive' : 'negative');
      recordAnswer(word.id, isCorrect, word.word);

      setQuestionLoading(true);
      const nextWord = await pickWordByPriority();
      setWord(nextWord);

      if (nextWord) {
        const isWordPremium = nextWord.vocab_packs?.is_premium ?? false;
        const isLocked = isWordPremium && !(await isPremium(user.id));
        setLocked(isLocked);

        if (!isLocked) {
          const nextOptions = await getQuizOptions(nextWord.id, nextWord.definition);
          setOptions(nextOptions);
        } else {
          setOptions([]);
        }
      } else {
        setOptions([]);
      }

      void refreshAdaptive();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not submit answer.');
    } finally {
      setSubmitting(false);
      setQuestionLoading(false);
    }
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <div className="flex items-center gap-2">
          {premiumUser ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Premium</span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Free</span>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyBadgeClass}`}>
            Current Level: {difficulty[0].toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
      </header>

      <div className="mb-4 grid gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:grid-cols-3">
        <div className="flex items-center justify-between md:block">
          <p className="text-xs text-gray-500">🔥 Streak</p>
          <p className="text-base font-bold text-orange-500">{streak}</p>
        </div>
        <div className="flex items-center justify-between md:block">
          <p className="text-xs text-gray-500">⭐ XP</p>
          <p className="text-base font-bold text-indigo-700">+{sessionXP}</p>
        </div>
        <div className="flex items-center justify-between md:block">
          <p className="text-xs text-gray-500">🎯 Accuracy</p>
          <p className="text-base font-bold text-teal-600">{accuracy}%</p>
        </div>
      </div>

      <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-sm">
        <p className="mb-2 font-semibold text-gray-700">Words to Practice</p>
        {weakWords.slice(0, 5).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {weakWords.slice(0, 5).map((weak) => (
              <span key={weak.word_id} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {weak.word}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No weak words yet. Keep practicing.</p>
        )}
      </section>

      {questionLoading && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Loading question...
        </section>
      )}

      {word && !questionLoading && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            {(word.vocab_packs?.is_premium ?? false) ? '🔒 Premium Pack' : 'Free Pack'}
          </p>
          <h2 className="mt-1 text-2xl font-black">{word.word}</h2>

          {locked ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Unlock premium to continue</p>
              <Link to="/upgrade" className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAnswer(option)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {!word && !loadError && !questionLoading && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No quiz words are available yet.
        </section>
      )}

      {loadError && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </section>
      )}

      <section className={`mt-4 rounded-xl p-3 text-sm ${answerClass || 'bg-gray-50'}`}>
        <p>{message || 'Answer to earn XP.'}</p>
        <p className={`mt-1 font-semibold ${feedbackTone === 'positive' ? 'text-emerald-700' : feedbackTone === 'negative' ? 'text-red-700' : ''}`}>
          {xpMessage || '+0 XP'} · Streak: 🔥 {streak} · Accuracy: {accuracy}%
        </p>
      </section>

      <Link to="/leaderboard" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
        View Leaderboard
      </Link>
    </main>
  );
}