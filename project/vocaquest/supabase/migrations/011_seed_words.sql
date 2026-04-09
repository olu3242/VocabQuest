-- 011_seed_words.sql
-- 20 starter words across all 4 grade band worlds

INSERT INTO words (word, phonetic, definition, example_sentence, grade_band, difficulty, topic_tags) VALUES

-- K-2: Word Garden
('brave',    '/breɪv/',        'Ready to do things that might be scary.',               'The brave dog jumped into the river to help.',               'k2',  1, ARRAY['character', 'emotions']),
('tiny',     '/ˈtaɪni/',       'Very, very small.',                                     'A tiny ant carried a big crumb.',                            'k2',  1, ARRAY['size', 'science']),
('curious',  '/ˈkjʊəriəs/',    'Wanting to know or learn about something.',             'The curious cat looked inside the box.',                     'k2',  2, ARRAY['character', 'learning']),
('gentle',   '/ˈdʒentl/',      'Soft and careful, not rough.',                          'She was gentle when she held the baby bird.',                'k2',  1, ARRAY['character', 'nature']),
('helpful',  '/ˈhelpfʊl/',     'Doing good things for others.',                         'The helpful boy picked up the toys.',                        'k2',  1, ARRAY['character', 'community']),

-- 3-5: Sentence City
('resilient',    '/rɪˈzɪliənt/',   'Able to recover quickly from difficulty.',              'The resilient team kept playing even after losing three games.', '35', 3, ARRAY['character', 'sports']),
('collaborate',  '/kəˈlæbəreɪt/', 'To work together with others on something.',            'The students decided to collaborate on the science project.',    '35', 2, ARRAY['school', 'teamwork']),
('adequate',     '/ˈædɪkwət/',    'Enough or satisfactory for the purpose.',               'Make sure you have adequate time to finish the test.',           '35', 2, ARRAY['school', 'planning']),
('persevere',    '/ˌpɜːsɪˈvɪər/', 'To keep trying even when things are hard.',             'She chose to persevere with her math homework until she got it.','35', 3, ARRAY['character', 'learning']),
('inquisitive',  '/ɪnˈkwɪzɪtɪv/', 'Asking many questions; eager to learn.',                'The inquisitive student always had five questions ready.',       '35', 3, ARRAY['character', 'learning']),

-- 6-8: Expression Academy
('ambiguous',  '/æmˈbɪɡjuəs/', 'Open to more than one interpretation; unclear.',       'The ambiguous instructions left the class confused.',          '68', 3, ARRAY['language', 'communication']),
('empathize',  '/ˈempəθaɪz/',  'To understand and share the feelings of another.',     'A good leader must empathize with their team.',                '68', 2, ARRAY['character', 'social']),
('contradict', '/ˌkɒntrəˈdɪkt/', 'To say or show the opposite of something.',          'His actions seemed to contradict everything he had said.',     '68', 2, ARRAY['language', 'logic']),
('articulate', '/ɑːˈtɪkjʊlət/', 'Expressing ideas clearly and fluently.',              'She gave an articulate speech that impressed the audience.',   '68', 3, ARRAY['communication', 'speaking']),
('nuance',     '/ˈnjuːɑːns/',  'A subtle difference in meaning or expression.',        'Understanding the nuance between the two words matters.',      '68', 3, ARRAY['language', 'writing']),

-- 9-12: Fluency Arena
('equivocate', '/ɪˈkwɪvəkeɪt/', 'To use ambiguous language to avoid commitment.',      'A skilled debater learns to detect when an opponent equivocates.', '912', 3, ARRAY['debate', 'rhetoric']),
('juxtapose',  '/ˈdʒʌkstəpəʊz/', 'To place two things side by side for contrast.',    'The author chose to juxtapose wealth and poverty in one chapter.',  '912', 2, ARRAY['writing', 'literature']),
('eloquent',   '/ˈeləkwənt/',  'Fluent and persuasive in speech or writing.',          'Her eloquent defence of the proposal earned a standing ovation.',  '912', 2, ARRAY['communication', 'speaking']),
('paradox',    '/ˈpærədɒks/',  'A statement that contradicts itself yet may be true.', 'The paradox of freedom is that unlimited freedom can limit others.','912', 3, ARRAY['philosophy', 'logic']),
('pragmatic',  '/præɡˈmætɪk/', 'Dealing with things practically rather than theoretically.', 'A pragmatic approach to the budget crisis proved most effective.','912', 2, ARRAY['thinking', 'leadership'])

ON CONFLICT DO NOTHING;
