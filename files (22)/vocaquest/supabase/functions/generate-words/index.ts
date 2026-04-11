import { createClient } from 'npm:@supabase/supabase-js@2';

type DifficultyLabel = 'easy' | 'medium' | 'hard';

interface GeneratedWord {
  word: string;
  definition: string;
  example_sentence: string;
  phonetic?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toGradeBand(gradeLevel: number): 'k2' | '35' | '68' | '912' {
  if (gradeLevel <= 2) return 'k2';
  if (gradeLevel <= 5) return '35';
  if (gradeLevel <= 8) return '68';
  return '912';
}

function toDifficultyValue(difficulty: DifficultyLabel): 1 | 2 | 3 {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'hard') return 3;
  return 2;
}

function cleanJson(content: string): string {
  return content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function coerceWords(payload: unknown): GeneratedWord[] {
  if (Array.isArray(payload)) return payload as GeneratedWord[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)) {
    return (payload as { items: GeneratedWord[] }).items;
  }
  return [];
}

function normalizeDifficulty(value: unknown): DifficultyLabel {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'easy';
}

function normalizeGradeLevel(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 12) {
    return Math.floor(value);
  }
  return 3;
}

async function insertWordsWithFallback(
  adminClient: ReturnType<typeof createClient>,
  rows: Array<{
    word: string;
    definition: string;
    difficulty: DifficultyLabel;
    grade_level: number;
    example_sentence: string;
  }>
) {
  const primary = await adminClient
    .from('words')
    .upsert(rows, { onConflict: 'word', ignoreDuplicates: true })
    .select('id, word, example_sentence, difficulty, grade_level');

  if (!primary.error) {
    return primary;
  }

  const fallbackRows = rows.map((row) => ({
    word: row.word,
    definition: row.definition,
    example_sentence: row.example_sentence,
    grade_band: toGradeBand(row.grade_level),
    difficulty: toDifficultyValue(row.difficulty),
    phonetic: `/${row.word}/`,
    is_active: true,
  }));

  const fallback = await adminClient
    .from('words')
    .upsert(fallbackRows, { onConflict: 'word', ignoreDuplicates: true })
    .select('id, word, example_sentence, difficulty');

  return fallback;
}

async function insertSentencesWithFallback(
  adminClient: ReturnType<typeof createClient>,
  rows: Array<{
    sentence: string;
    word_id: string;
    difficulty: DifficultyLabel;
    grade_level: number;
  }>
) {
  const dedupedMap = new Map<string, {
    sentence: string;
    word_id: string;
    difficulty: DifficultyLabel;
    grade_level: number;
  }>();

  for (const row of rows) {
    const key = row.sentence.trim().toLowerCase();
    if (!key) continue;
    if (!dedupedMap.has(key)) dedupedMap.set(key, row);
  }

  const dedupedRows = Array.from(dedupedMap.values());
  if (dedupedRows.length === 0) {
    return { error: null };
  }

  const sentenceTexts = dedupedRows.map((row) => row.sentence);
  const { data: existingSentences } = await adminClient
    .from('sentences')
    .select('sentence')
    .in('sentence', sentenceTexts);

  const existingSet = new Set((existingSentences ?? []).map((row: { sentence: string }) => row.sentence));
  const filteredRows = dedupedRows.filter((row) => !existingSet.has(row.sentence));

  if (filteredRows.length === 0) {
    return { error: null };
  }

  const primary = await adminClient.from('sentences').insert(filteredRows);
  if (!primary.error) return primary;

  const fallbackRows = filteredRows.map((row) => ({
    sentence: row.sentence,
    word_id: row.word_id,
  }));

  return await adminClient.from('sentences').insert(fallbackRows);
}

async function generateBatch(
  openAiKey: string,
  currentBatchSize: number,
  gradeLevel: number,
  difficulty: DifficultyLabel
) {
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate ${currentBatchSize} vocabulary words for grade ${gradeLevel} with ${difficulty} difficulty.

STRICT RULES:
- Words must be common and appropriate for grade ${gradeLevel}
- No rare or obscure words
- Definitions must be clear and simple
- Example sentences must demonstrate correct usage

FORMAT RULES:
- Output must be valid JSON array
- No markdown
- No explanations
- No trailing commas
- No extra text

VALIDATE BEFORE OUTPUT:
- Each object must include:
  word, definition, example_sentence

Return JSON only.`,
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    throw new Error(`AI error: ${await aiResponse.text()}`);
  }

  const aiData = await aiResponse.json();
  const raw = String(aiData?.choices?.[0]?.message?.content ?? '').trim();
  const cleaned = cleanJson(raw);
  const parsed = JSON.parse(cleaned) as unknown;
  return coerceWords(parsed);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const requestedCount =
      typeof body?.count === 'number' && body.count > 0
        ? Math.min(Math.floor(body.count), 500)
        : 20;
    const batchSize = 20;
    const totalBatches = Math.ceil(requestedCount / batchSize);

    const gradeCycle = [2, 5, 8, 12];
    const difficultyCycle: DifficultyLabel[] = ['easy', 'medium', 'hard'];

    const selectedGradeLevel = normalizeGradeLevel(body?.grade_level);
    const selectedDifficulty = normalizeDifficulty(body?.difficulty);
    const cycleGrades = body?.grade_level === undefined || body?.grade_level === null;
    const cycleDifficulties = body?.difficulty === undefined || body?.difficulty === null;

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? '',
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingWordRows } = await adminClient
      .from('words')
      .select('word')
      .limit(10000);

    const existingWords = new Set(
      (existingWordRows ?? [])
        .map((row: { word?: string }) => String(row.word ?? '').trim().toLowerCase())
        .filter(Boolean)
    );

    const { count: currentWordCount, error: countError } = await adminClient
      .from('words')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if ((currentWordCount ?? 0) >= 25000) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Word bank full',
          current_total: currentWordCount ?? 0,
          total_inserted: 0,
          skipped_duplicates: 0,
          invalid_entries: 0,
          failed_batches: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let totalInserted = 0;
    let skippedDuplicates = 0;
    let prefilteredDuplicates = 0;
    let invalidEntries = 0;
    let failedBatches = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const currentBatchSize = Math.min(batchSize, requestedCount - batchIndex * batchSize);
      const gradeLevel = cycleGrades ? gradeCycle[batchIndex % gradeCycle.length] : selectedGradeLevel;
      const difficulty = cycleDifficulties
        ? difficultyCycle[batchIndex % difficultyCycle.length]
        : selectedDifficulty;

      try {
        let attempts = 0;
        let generated: GeneratedWord[] = [];

        while (attempts < 3 && generated.length === 0) {
          try {
            generated = await generateBatch(openAiKey, currentBatchSize, gradeLevel, difficulty);
          } catch (err) {
            attempts += 1;
            if (attempts >= 3) throw err;
          }
        }

        const seen = new Set<string>();
        const validRows = generated
          .map((item) => ({
            word: String(item.word ?? '').trim(),
            definition: String(item.definition ?? '').trim(),
            example_sentence: String(item.example_sentence ?? '').trim(),
            difficulty,
            grade_level: gradeLevel,
          }))
          .filter((item) => {
            if (
              !item.word ||
              !item.definition ||
              !item.example_sentence ||
              item.word.length < 3 ||
              item.definition.length < 10 ||
              item.example_sentence.length < 10
            ) {
              invalidEntries += 1;
              return false;
            }

            const key = item.word.toLowerCase();
            if (seen.has(key)) {
              invalidEntries += 1;
              return false;
            }

            if (existingWords.has(key)) {
              prefilteredDuplicates += 1;
              return false;
            }

            seen.add(key);
            return true;
          });

        if (validRows.length === 0) {
          continue;
        }

        const { data: insertedWords, error: insertError } = await insertWordsWithFallback(adminClient, validRows);

        if (insertError) {
          failedBatches += 1;
          console.error('insert words failed', insertError.message);
          continue;
        }

        const insertedCount = insertedWords?.length ?? 0;
        totalInserted += insertedCount;
        const skippedInBatch = Math.max(validRows.length - insertedCount, 0);
        skippedDuplicates += skippedInBatch;

        for (const row of insertedWords ?? []) {
          const key = String((row as Record<string, unknown>).word ?? '').trim().toLowerCase();
          if (key) existingWords.add(key);
        }

        console.log({
          batch: batchIndex,
          inserted: insertedCount,
          skipped: skippedInBatch,
        });

        if (insertedCount > 0) {
          const sentenceRows = (insertedWords ?? []).map((row: Record<string, unknown>) => ({
            sentence: String(row.example_sentence ?? ''),
            word_id: String(row.id ?? ''),
            difficulty,
            grade_level: gradeLevel,
          })).filter((row) => row.sentence && row.word_id);

          if (sentenceRows.length > 0) {
            const sentenceInsert = await insertSentencesWithFallback(adminClient, sentenceRows);
            if (sentenceInsert.error) {
              console.error('insert sentences failed', sentenceInsert.error.message);
            }
          }
        }
      } catch (batchError) {
        failedBatches += 1;
        console.error('batch failed', batchError);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({
        success: true,
        requested: requestedCount,
        batch_size: batchSize,
        batches: totalBatches,
        total_inserted: totalInserted,
        skipped_duplicates: skippedDuplicates,
        prefiltered_duplicates: prefilteredDuplicates,
        invalid_entries: invalidEntries,
        failed_batches: failedBatches,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});