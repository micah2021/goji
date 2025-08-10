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

    const systemPrompt = `You are an AI tutor for the Goji language, a Chadic language from Nigeria. You help users learn through:
    1. Correcting pronunciation and grammar
    2. Explaining cultural context
    3. Providing interactive exercises
    4. Adapting to the user's learning level
    
    Current lesson context: ${lesson_context || 'General conversation'}
    
    Respond in a helpful, encouraging manner. Include Goji words with English/Hausa translations when relevant.`;

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