import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, theme } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let systemPrompt = '';
    if (type === 'word') {
      systemPrompt = `You are an expert in the Goji language, a Chadic language from Nigeria. Generate authentic Goji words with accurate English and Hausa translations. Provide cultural context and example sentences. Format your response as JSON with fields: goji_word, english_translation, hausa_translation, example_sentence, cultural_context.`;
    } else if (type === 'story') {
      systemPrompt = `You are a storyteller preserving Goji cultural heritage. Create authentic folktales, proverbs, or cultural stories in the Goji language with English and Hausa translations. Format as JSON with fields: title, goji_text, english_translation, hausa_translation, cultural_context.`;
    } else if (type === 'lesson') {
      systemPrompt = `You are a Goji language teacher. Create structured lessons with vocabulary, grammar points, and practice exercises. Format as JSON with fields: lesson_title, vocabulary (array of word objects), grammar_point, practice_sentences, cultural_notes.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Theme: ${theme}. ${prompt}` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-goji-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});