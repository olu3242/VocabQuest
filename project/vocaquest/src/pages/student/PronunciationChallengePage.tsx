// src/pages/student/PronunciationChallengePage.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { getMockWordById } from '../../data/mockWords';
import { usePronunciation } from '../../hooks/usePronunciation';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import XPPopup from '../../components/gamification/XPPopup';
import { ROUTES } from '../../constants/routes.constants';
import { useState } from 'react';

export default function PronunciationChallengePage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  const word = wordId ? getMockWordById(wordId) : undefined;
  const { state, result, startRecording, reset, isRecording, isDone, isError, errorMessage } =
    usePronunciation(word?.word ?? '');

  if (!word) return <EmptyState emoji="🔍" title="Word not found" />;

  const handlePass = () => {
    setXpAmount(result?.xpEarned ?? 0);
    setShowXP(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {showXP && (
        <XPPopup
          amount={xpAmount}
          onComplete={() => navigate(ROUTES.STUDENT_SENTENCE(word.id))}
        />
      )}

      <div className="max-w-lg mx-auto px-4 pt-10 pb-20">
        <button
          onClick={() => navigate(ROUTES.STUDENT_LEARN_WORD(word.id))}
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
                i === 0 ? 'bg-teal-100 text-teal-700'
                : i === 1 ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-400'
              }`}>
                <span>{i + 1}</span>
                <span>{step}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-1">Say it out loud</h2>
        <p className="text-gray-500 text-sm mb-8">
          Tap the mic and pronounce the word clearly.
        </p>

        {/* Word display */}
        <div className="bg-white rounded-2xl shadow-card p-6 text-center mb-8">
          <p className="text-4xl font-bold text-gray-900 capitalize mb-2">{word.word}</p>
          <p className="text-base font-mono text-gray-400">{word.phonetic}</p>
        </div>

        {/* Mic button */}
        {(state === 'idle' || state === 'recording') && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <button
              onClick={isRecording ? undefined : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 text-white mic-pulse scale-110'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-sm text-gray-500">
              {isRecording ? 'Listening… speak now' : 'Tap to start recording'}
            </p>
          </div>
        )}

        {/* Processing */}
        {state === 'processing' && (
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center animate-spin">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
            <p className="text-sm text-gray-500">Scoring your pronunciation…</p>
          </div>
        )}

        {/* Result */}
        {isDone && result && (
          <div className={`rounded-2xl p-5 mb-6 ${result.passed ? 'bg-teal-50 border border-teal-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.passed
                ? <CheckCircle className="w-6 h-6 text-teal-600" />
                : <XCircle className="w-6 h-6 text-orange-500" />}
              <p className={`font-semibold ${result.passed ? 'text-teal-700' : 'text-orange-700'}`}>
                {result.passed ? 'Great pronunciation!' : 'Keep trying!'}
              </p>
            </div>

            {/* Score bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Clarity score</span>
                <span className="font-mono">{Math.round(result.clarity * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${result.passed ? 'bg-teal-500' : 'bg-orange-400'}`}
                  style={{ width: `${result.clarity * 100}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-1">{result.feedback}</p>
            {result.recognized && (
              <p className="text-xs text-gray-400">Heard: "{result.recognized}"</p>
            )}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Action buttons */}
        {isDone && result?.passed && (
          <Button fullWidth size="lg" onClick={handlePass}>
            Next: Use it in a sentence →
          </Button>
        )}
        {(isDone && !result?.passed || isError) && (
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={reset}>
              Try again
            </Button>
            <Button fullWidth onClick={() => navigate(ROUTES.STUDENT_SENTENCE(word.id))}>
              Skip (+0 XP)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
