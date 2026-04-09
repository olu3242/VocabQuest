// src/hooks/usePronunciation.ts

import { useState, useRef, useCallback } from 'react';
import {
  createSpeechRecognizer,
  scorePronunciation,
  PronunciationResult,
} from '../services/pronunciation.service';

type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export function usePronunciation(targetWord: string) {
  const [state, setState] = useState<RecordingState>('idle');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognition | null>(null);

  const startRecording = useCallback(() => {
    const recognizer = createSpeechRecognizer();

    if (!recognizer) {
      setErrorMessage('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      setState('error');
      return;
    }

    recognizerRef.current = recognizer;
    setState('recording');
    setResult(null);
    setErrorMessage(null);

    recognizer.onresult = (event) => {
      setState('processing');
      const recognized = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      const attempt = attemptCount + 1;
      setAttemptCount(attempt);

      const scored = scorePronunciation(recognized, targetWord, confidence, attempt);
      setResult(scored);
      setState('done');
    };

    recognizer.onerror = (event) => {
      if (event.error === 'no-speech') {
        setErrorMessage("We didn't catch that. Tap the mic and speak clearly.");
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access was denied. Please allow microphone use in your browser settings.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      setState('error');
    };

    recognizer.start();
  }, [targetWord, attemptCount]);

  const stopRecording = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setErrorMessage(null);
  }, []);

  return {
    state,
    result,
    attemptCount,
    errorMessage,
    startRecording,
    stopRecording,
    reset,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    isDone: state === 'done',
    isError: state === 'error',
    canRetry: state === 'done' && result?.passed === false,
  };
}
