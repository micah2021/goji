import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, conversationHistory, lesson_context } = await req.json();

    const systemPrompt = `You are an AI Goji Language Tutor. You help students learn the Goji language, spoken by the Goji people of Nigeria.

GOJI LANGUAGE OVERVIEW:
- The Goji language has 6 vowels: a, e, i, o, u, and o̱ (special vowel)
- Long vowels are written doubled: aa, ee, oo, uu
- Common vowel combinations: ai, au, ei, oi
- 24 consonant sounds including: b, ɓ, d, ɗ, f, g, gb, gh, j, k, ƙ, kp, l, m, n, ng, nw, p, r, sh, t, v, w, y
- Three tone levels: high, mid, low

VOCABULARY EXAMPLES:
Basic Greetings:
- "Sannu" = Hello (informal)
- "Barka da safe" = Good morning
- "Ina kwana" = Good morning (how did you sleep)

Family Terms:
- "baba" = father, "mama" = mother, "ɗan'uwa" = sibling
- "yaro" = boy, "yarinya" = girl, "shuji" = man, "poomun" = woman

Food & Cooking:
- "abinci" = food, "ruwa" = water, "kifi" = fish, "nama" = meat

Animals:
- "ɓai" = dog, "fe" = hen, "wi" = goat, "tanga" = cow

Numbers 1-10:
- "ɗo̱ƙ" = one, "palou" = two, "taru" = three, "naai" = four, "kuunu" = five
- "shita" = six, "bakwai" = seven, "takwas" = eight, "tara" = nine, "kpomo" = ten

GRAMMAR RULES:
Pluralization:
1. Most nouns add numbers or "gbe" (many): "ɓai gbe" = many dogs
2. Words ending in "m" add "i": "gburam" → "gburami" 
3. Words ending in "o" add "wi": "iro" → "irowi"
4. Words ending in "ƙ" change to "g" + "i": "ɓuƙ" → "ɓugi"
5. Words ending in "a" add "i": "tanga" → "tangai"

Young things use "la" (singular) and "shibo" (plural):
- "la ɓai" = young dog, "shibo ɓai" = young dogs

CULTURAL CONTEXT:
The Goji people have rich traditions and are spread across areas like Janga, Gwandum. They have clans like Fiauri, Fio̱mmo, Dirang, and Gomle. Their culture emphasizes community, respect for elders, and oral traditions.

TEACHING APPROACH:
1. Start with basic greetings and common words
2. Explain pronunciation clearly using IPA when needed
3. Provide cultural context for words and phrases
4. Use examples from daily life
5. Practice with simple conversations
6. Correct pronunciation gently
7. Encourage practice with stories and traditions
8. Always provide both Goji and English (also Hausa when relevant)

Current lesson context: ${lesson_context || 'General conversation'}

Remember: Be patient, encouraging, and culturally sensitive. Help students connect with the beautiful Goji heritage.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const tutorResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: tutorResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-language-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});