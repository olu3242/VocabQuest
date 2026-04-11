// src/data/mockWords.ts
// 20 seed words across all 4 grade band worlds for Phase 1-4 development

import { Word } from '../types/student.types';

export const MOCK_WORDS: Word[] = [
  // K-2 — Word Garden
  { id: 'w001', word: 'brave', phonetic: '/breɪv/', definition: 'Ready to do things that might be scary.', example_sentence: 'The brave dog jumped into the river to help.', grade_band: 'k2', difficulty: 1 },
  { id: 'w002', word: 'tiny', phonetic: '/ˈtaɪni/', definition: 'Very, very small.', example_sentence: 'A tiny ant carried a big crumb.', grade_band: 'k2', difficulty: 1 },
  { id: 'w003', word: 'curious', phonetic: '/ˈkjʊəriəs/', definition: 'Wanting to know or learn about something.', example_sentence: 'The curious cat looked inside the box.', grade_band: 'k2', difficulty: 2 },
  { id: 'w004', word: 'gentle', phonetic: '/ˈdʒentl/', definition: 'Soft and careful, not rough.', example_sentence: 'She was gentle when she held the baby bird.', grade_band: 'k2', difficulty: 1 },
  { id: 'w005', word: 'helpful', phonetic: '/ˈhelpfʊl/', definition: 'Doing good things for others.', example_sentence: 'The helpful boy picked up the toys.', grade_band: 'k2', difficulty: 1 },

  // 3-5 — Sentence City
  { id: 'w006', word: 'resilient', phonetic: '/rɪˈzɪliənt/', definition: 'Able to recover quickly from difficulty.', example_sentence: 'The resilient team kept playing even after losing three games.', grade_band: '35', difficulty: 3 },
  { id: 'w007', word: 'collaborate', phonetic: '/kəˈlæbəreɪt/', definition: 'To work together with others on something.', example_sentence: 'The students decided to collaborate on the science project.', grade_band: '35', difficulty: 2 },
  { id: 'w008', word: 'adequate', phonetic: '/ˈædɪkwət/', definition: 'Enough or satisfactory for the purpose.', example_sentence: 'Make sure you have adequate time to finish the test.', grade_band: '35', difficulty: 2 },
  { id: 'w009', word: 'persevere', phonetic: '/ˌpɜːsɪˈvɪər/', definition: 'To keep trying even when things are hard.', example_sentence: 'She chose to persevere with her math homework until she understood it.', grade_band: '35', difficulty: 3 },
  { id: 'w010', word: 'inquisitive', phonetic: '/ɪnˈkwɪzɪtɪv/', definition: 'Asking many questions; eager to learn.', example_sentence: 'The inquisitive student always had five questions ready.', grade_band: '35', difficulty: 3 },

  // 6-8 — Expression Academy
  { id: 'w011', word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', definition: 'Open to more than one interpretation; unclear.', example_sentence: 'The ambiguous instructions left the class confused about the assignment.', grade_band: '68', difficulty: 3 },
  { id: 'w012', word: 'empathize', phonetic: '/ˈempəθaɪz/', definition: 'To understand and share the feelings of another.', example_sentence: 'A good leader must empathize with the struggles of their team.', grade_band: '68', difficulty: 2 },
  { id: 'w013', word: 'contradict', phonetic: '/ˌkɒntrəˈdɪkt/', definition: 'To say or show the opposite of something.', example_sentence: 'His actions seemed to contradict everything he had said earlier.', grade_band: '68', difficulty: 2 },
  { id: 'w014', word: 'articulate', phonetic: '/ɑːˈtɪkjʊlət/', definition: 'Expressing ideas clearly and fluently.', example_sentence: 'She gave an articulate speech that impressed the entire audience.', grade_band: '68', difficulty: 3 },
  { id: 'w015', word: 'nuance', phonetic: '/ˈnjuːɑːns/', definition: 'A subtle difference in meaning or expression.', example_sentence: 'Understanding the nuance between the two words can change the meaning of a sentence.', grade_band: '68', difficulty: 3 },

  // 9-12 — Fluency Arena
  { id: 'w016', word: 'equivocate', phonetic: '/ɪˈkwɪvəkeɪt/', definition: 'To use ambiguous language to avoid commitment or deceive.', example_sentence: 'A skilled debater learns to detect when an opponent is trying to equivocate.', grade_band: '912', difficulty: 3 },
  { id: 'w017', word: 'juxtapose', phonetic: '/ˈdʒʌkstəpəʊz/', definition: 'To place two things side by side for contrast.', example_sentence: 'The author chose to juxtapose wealth and poverty in the same chapter.', grade_band: '912', difficulty: 2 },
  { id: 'w018', word: 'eloquent', phonetic: '/ˈeləkwənt/', definition: 'Fluent and persuasive in speech or writing.', example_sentence: 'Her eloquent defence of the proposal earned her a standing ovation.', grade_band: '912', difficulty: 2 },
  { id: 'w019', word: 'paradox', phonetic: '/ˈpærədɒks/', definition: 'A statement that contradicts itself yet may be true.', example_sentence: 'The paradox of freedom is that unlimited freedom can limit others.', grade_band: '912', difficulty: 3 },
  { id: 'w020', word: 'pragmatic', phonetic: '/præɡˈmætɪk/', definition: 'Dealing with things practically rather than theoretically.', example_sentence: 'A pragmatic approach to solving the budget crisis proved more effective than idealism.', grade_band: '912', difficulty: 2 },
];

export function getMockWordsByGradeBand(gradeBand: string): Word[] {
  return MOCK_WORDS.filter(w => w.grade_band === gradeBand);
}

export function getMockWordById(id: string): Word | undefined {
  return MOCK_WORDS.find(w => w.id === id);
}
