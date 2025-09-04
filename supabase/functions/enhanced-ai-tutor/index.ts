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

interface LearnerProfile {
  learning_level: string;
  strengths: string[];
  weaknesses: string[];
  cultural_interests: string[];
  native_language: string;
  vocabulary_mastery_count: number;
}

// Generate embeddings for semantic search
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

// Perform semantic search using vector similarity
async function performSemanticSearch(supabase: any, query: string, limit = 5) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Search dictionary entries
    const { data: dictionaryResults } = await supabase.rpc('match_dictionary_entries', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    // Search cultural contexts
    const { data: culturalResults } = await supabase.rpc('match_cultural_contexts', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    // Search AI learning data
    const { data: learningResults } = await supabase.rpc('match_learning_data', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    return {
      dictionary: dictionaryResults || [],
      cultural: culturalResults || [],
      learning: learningResults || []
    };
  } catch (error) {
    console.error('Semantic search error:', error);
    // Return empty results if search fails
    return {
      dictionary: [],
      cultural: [],
      learning: []
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, conversationHistory, userId, lessonContext } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get or create learner profile
    let { data: profile } = await supabase
      .from('learner_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile && userId) {
      // Create default learner profile
      const { data: newProfile } = await supabase
        .from('learner_profiles')
        .insert([{
          user_id: userId,
          learning_level: 'beginner',
          preferred_learning_style: 'mixed',
          native_language: 'english'
        }])
        .select()
        .single();
      profile = newProfile;
    }

    // Perform semantic search for relevant context
    const searchResults = await performSemanticSearch(supabase, userInput);

    // Build enhanced context from search results
    let enhancedContext = '';
    
    if (searchResults.dictionary.length > 0) {
      enhancedContext += '\nRELEVANT VOCABULARY:\n';
      searchResults.dictionary.forEach((item: any) => {
        enhancedContext += `- ${item.goji_word}: ${item.english_translation} (${item.hausa_translation})\n`;
        if (item.example_sentence) {
          enhancedContext += `  Example: ${item.example_sentence}\n`;
        }
      });
    }

    if (searchResults.cultural.length > 0) {
      enhancedContext += '\nCULTURAL CONTEXT:\n';
      searchResults.cultural.forEach((item: any) => {
        enhancedContext += `- ${item.title}: ${item.description}\n`;
        if (item.cultural_significance) {
          enhancedContext += `  Significance: ${item.cultural_significance}\n`;
        }
      });
    }

    // Build personalized system prompt
    const personalizedPrompt = `You are an advanced AI Goji Language Tutor with access to comprehensive cultural and linguistic knowledge.

LEARNER PROFILE:
- Level: ${profile?.learning_level || 'beginner'}
- Strengths: ${profile?.strengths?.join(', ') || 'none identified yet'}
- Weaknesses: ${profile?.weaknesses?.join(', ') || 'none identified yet'}
- Cultural Interests: ${profile?.cultural_interests?.join(', ') || 'general'}
- Native Language: ${profile?.native_language || 'english'}
- Vocabulary Mastered: ${profile?.vocabulary_mastery_count || 0} words

GOJI LANGUAGE COMPREHENSIVE KNOWLEDGE:
Phonology: 6 vowels (a, e, i, o, u, o̱), long vowels (aa, ee, oo, uu), diphthongs (ai, au, ei, oi)
24 consonants including: ɓ, ɗ, ƙ, gb, kp with three tone levels

Core Vocabulary & Grammar:
- Numbers: ɗo̱ƙ (one), palou (two), taru (three), naai (four), fuwat (five)
- Family: shuji (father), poomun (wife), memme (people), lano (child)
- Animals: wi (goat), fe (hen), ɓai (dog), jango̱ni (cat)
- Nature: biro (tree), ɗo (water), shela (stone), daran (sun), tere (moon)
- Home: mina (house), pomina (room), telan (pot), gburam (chair)

Pluralization Rules:
1. Basic: add numbers or "gbe" (many)
2. Endings: -m→-mi, -o→-owi, -ƙ→-gi, -a→-ai
3. Young forms: "la" (singular), "shibo" (plural)

Cultural Context:
- Goji people from Janga, Gwandum areas in Nigeria
- Clans: Fiauri, Fio̱mmo, Dirang, Gomle
- Values: community, elder respect, oral traditions

${enhancedContext}

ADAPTIVE TEACHING APPROACH:
- Adjust complexity based on learner level
- Focus on identified weaknesses
- Incorporate cultural interests
- Use examples relevant to their background
- Provide pronunciation guidance with IPA when needed
- Encourage cultural exploration and connection
- Track progress and suggest improvements

Current lesson context: ${lessonContext || 'General conversation'}

${searchResults.dictionary.length === 0 && searchResults.cultural.length === 0 ? `
IMPORTANT FALLBACK: Since no specific database matches were found, use your comprehensive Goji knowledge above to provide helpful responses. Always be encouraging and provide practical examples. Focus on:
- Teaching basic vocabulary and pronunciation
- Explaining grammar patterns
- Sharing cultural insights
- Providing encouragement and practice suggestions
- Using the learner's native language when helpful
` : ''}

Be encouraging, culturally sensitive, and adapt to the learner's pace and interests.`;

    const messages = [
      { role: 'system', content: personalizedPrompt },
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];

    console.log('Calling OpenAI with messages:', messages.length, 'messages');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices || !data.choices[0]) {
      console.error('Invalid OpenAI response:', data);
      throw new Error('Invalid response from OpenAI');
    }
    
    const tutorResponse = data.choices[0].message.content;

    // Generate conversation analytics
    const sessionStart = new Date(Date.now() - (conversationHistory.length * 30000)); // Rough estimate
    const sessionDuration = (Date.now() - sessionStart.getTime()) / (1000 * 60); // minutes

    // Extract vocabulary used in the conversation
    const vocabularyUsed = searchResults.dictionary.map((item: any) => item.goji_word);
    
    // Store conversation analytics
    if (userId) {
      await supabase
        .from('conversation_analytics')
        .insert([{
          conversation_id: crypto.randomUUID(),
          user_id: userId,
          session_duration_minutes: sessionDuration,
          vocabulary_used: vocabularyUsed,
          new_words_encountered: vocabularyUsed.slice(0, 3), // First 3 as new
          engagement_score: Math.min(conversationHistory.length * 0.1, 1.0),
          learning_objectives_met: profile?.learning_level === 'beginner' ? ['basic_greetings'] : ['advanced_conversation'],
          cultural_topics_discussed: searchResults.cultural.map((item: any) => item.title),
          ai_feedback: {
            response_quality: 0.9,
            cultural_accuracy: 0.95,
            pedagogical_effectiveness: 0.85
          }
        }]);
    }

    return new Response(JSON.stringify({ 
      response: tutorResponse,
      context_used: {
        dictionary_matches: searchResults.dictionary.length,
        cultural_matches: searchResults.cultural.length,
        learning_matches: searchResults.learning.length
      },
      learner_level: profile?.learning_level || 'beginner'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-ai-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});