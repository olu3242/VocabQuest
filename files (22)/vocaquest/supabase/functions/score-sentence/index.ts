// supabase/functions/score-sentence/index.ts
// Scores student sentences using Claude API
// Handles both "sentence" mode and "sayItBetter" mode

import Anthropic from 'npm:@anthropic-ai/sdk@0.24.3';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode } = body;

    if (mode === 'sentence') {
      return await scoreSentence(body);
    } else if (mode === 'sayItBetter') {
      return await scoreSayItBetter(body);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function scoreSentence({ sentence, targetWord, gradeBand }: {
  sentence: string; targetWord: string; gradeBand: string;
}) {
  const gradeBandLabel: Record<string, string> = {
    k2: 'Kindergarten to Grade 2',
    '35': 'Grade 3 to 5',
    '68': 'Grade 6 to 8',
    '912': 'Grade 9 to 12',
  };

  const prompt = `You are a K-12 vocabulary coach scoring a student's sentence.

Target word: "${targetWord}"
Grade band: ${gradeBandLabel[gradeBand] ?? gradeBand}
Student sentence: "${sentence}"

Score the sentence on these dimensions (0.0 to 1.0):
- vocabularyStrength: how effectively the target word is used and its meaning demonstrated
- clarity: how clear, natural, and grammatically correct the sentence is  
- gradeAppropriateness: how well vocabulary and complexity match the grade band

Also provide:
- feedback: one encouraging sentence of coaching feedback (max 30 words)
- passed: true if average score >= 0.65

Return ONLY valid JSON, no preamble:
{
  "vocabularyStrength": 0.0,
  "clarity": 0.0,
  "gradeAppropriateness": 0.0,
  "overallScore": 0.0,
  "feedback": "...",
  "passed": false
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const clean = text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(clean);
  result.overallScore = (result.vocabularyStrength + result.clarity + result.gradeAppropriateness) / 3;
  result.passed = result.overallScore >= 0.65;

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function scoreSayItBetter({ originalSentence, improvedSentence, targetWord, gradeBand }: {
  originalSentence: string; improvedSentence: string; targetWord: string; gradeBand: string;
}) {
  const prompt = `You are a K-12 vocabulary coach evaluating a student's "Say It Better" improvement.

Target word: "${targetWord}"
Grade band: ${gradeBand}
Original sentence: "${originalSentence}"
Student improvement: "${improvedSentence}"

Score the improvement on (0.0 to 1.0):
- vocabularyStrength: how much stronger vocabulary is in the improvement
- tonalMaturity: appropriate improvement for the grade level
- clarity: still clear and natural

Also provide:
- feedback: one encouraging sentence (max 30 words)
- alternatives: array of exactly 2 strong alternative rewrites

Return ONLY valid JSON:
{
  "vocabularyStrength": 0.0,
  "tonalMaturity": 0.0,
  "clarity": 0.0,
  "feedback": "...",
  "alternatives": ["...", "..."]
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const clean = text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(clean);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
