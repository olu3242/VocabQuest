// src/components/cards/WordCard.tsx

import { Volume2 } from 'lucide-react';
import { Word } from '../../types/student.types';
import { GRADE_BANDS } from '../../constants/worlds.constants';

interface WordCardProps {
  word: Word;
  variant?: 'learn' | 'quiz' | 'mastered';
  onAudioPlay?: () => void;
  className?: string;
}

export default function WordCard({ word, variant = 'learn', onAudioPlay, className = '' }: WordCardProps) {
  const band = GRADE_BANDS[word.grade_band];

  const handleAudio = () => {
    if (word.audio_url) {
      new Audio(word.audio_url).play();
    } else {
      // Fallback to Web Speech API TTS
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
    onAudioPlay?.();
  };

  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-card p-6 border border-gray-100 transition-shadow duration-200',
        variant === 'mastered' ? 'ring-2 ring-teal-400 ring-offset-2' : '',
        className,
      ].join(' ')}
    >
      {/* World badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold mb-4"
        style={{ backgroundColor: band.color }}
      >
        <span>{band.emoji}</span>
        <span>{band.worldName}</span>
      </div>

      {/* Word + phonetic */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 capitalize">{word.word}</h2>
          <p className="text-sm font-mono text-gray-400 mt-0.5">{word.phonetic}</p>
        </div>
        <button
          onClick={handleAudio}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
          aria-label={`Hear pronunciation of ${word.word}`}
        >
          <Volume2 className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* Definition */}
      <p className="text-gray-700 text-base leading-relaxed mb-4">
        {word.definition}
      </p>

      {/* Example sentence */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Example</p>
        <p className="text-gray-600 text-sm italic">"{word.example_sentence}"</p>
      </div>

      {/* Difficulty dots */}
      <div className="flex items-center gap-1 mt-4">
        {[1, 2, 3].map((d) => (
          <div
            key={d}
            className={`w-2 h-2 rounded-full ${d <= word.difficulty ? 'bg-indigo-500' : 'bg-gray-200'}`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">
          {word.difficulty === 1 ? 'Easy' : word.difficulty === 2 ? 'Medium' : 'Hard'}
        </span>
      </div>
    </div>
  );
}
