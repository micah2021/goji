import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch training data from database
    const { data: dictEntries } = await supabase
      .from('dictionary_entries')
      .select('*')
      .limit(1000);

    const { data: culturalContexts } = await supabase
      .from('cultural_contexts')
      .select('*')
      .limit(500);

    const { data: conversations } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (*)
      `)
      .limit(200);

    // Generate fine-tuning format (JSONL)
    const trainingData = [];

    // Dictionary-based training examples
    dictEntries?.forEach(entry => {
      trainingData.push({
        messages: [
          {
            role: "system",
            content: "You are a Goji language tutor. Help users learn Goji vocabulary, grammar, and culture."
          },
          {
            role: "user", 
            content: `What does "${entry.goji_word}" mean?`
          },
          {
            role: "assistant",
            content: `"${entry.goji_word}" means "${entry.english_translation}" in English and "${entry.hausa_translation}" in Hausa. ${entry.example_sentence ? `Example: ${entry.example_sentence}` : ''} ${entry.cultural_context ? `Cultural note: ${entry.cultural_context}` : ''}`
          }
        ]
      });

      // Translation examples
      trainingData.push({
        messages: [
          {
            role: "system",
            content: "You are a Goji language tutor. Help users learn Goji vocabulary, grammar, and culture."
          },
          {
            role: "user",
            content: `How do you say "${entry.english_translation}" in Goji?`
          },
          {
            role: "assistant", 
            content: `"${entry.english_translation}" in Goji is "${entry.goji_word}". ${entry.pronunciation_guide ? `Pronunciation: ${entry.pronunciation_guide}` : ''}`
          }
        ]
      });
    });

    // Cultural context training
    culturalContexts?.forEach(context => {
      trainingData.push({
        messages: [
          {
            role: "system",
            content: "You are a Goji language tutor. Help users learn Goji vocabulary, grammar, and culture."
          },
          {
            role: "user",
            content: `Tell me about ${context.title}`
          },
          {
            role: "assistant",
            content: `${context.description} ${context.cultural_significance ? `Cultural significance: ${context.cultural_significance}` : ''} ${context.goji_content ? `In Goji: ${context.goji_content}` : ''}`
          }
        ]
      });
    });

    // Convert to JSONL format
    const jsonlData = trainingData
      .map(item => JSON.stringify(item))
      .join('\n');

    return new Response(jsonlData, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/jsonl',
        'Content-Disposition': 'attachment; filename="goji-training-data.jsonl"'
      },
    });

  } catch (error) {
    console.error('Error generating training data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});