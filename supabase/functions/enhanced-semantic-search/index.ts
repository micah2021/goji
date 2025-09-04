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

// Generate embeddings for search queries
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType, userId, filters } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    let results = {};

    if (searchType === 'dictionary' || searchType === 'all') {
      // Search dictionary entries with semantic similarity
      const { data: dictionaryData } = await supabase
        .from('dictionary_entries')
        .select('*, similarity')
        .rpc('match_dictionary_entries', {
          query_embedding: queryEmbedding,
          match_threshold: filters?.threshold || 0.7,
          match_count: filters?.limit || 10
        });

      results.dictionary = dictionaryData || [];
    }

    if (searchType === 'cultural' || searchType === 'all') {
      // Search cultural contexts
      const { data: culturalData } = await supabase
        .from('cultural_contexts')
        .select('*, similarity')
        .rpc('match_cultural_contexts', {
          query_embedding: queryEmbedding,
          match_threshold: filters?.threshold || 0.7,
          match_count: filters?.limit || 10
        });

      results.cultural = culturalData || [];
    }

    if (searchType === 'learning' || searchType === 'all') {
      // Search AI learning data
      const { data: learningData } = await supabase
        .from('ai_learning_data')
        .select('*, similarity')
        .rpc('match_learning_data', {
          query_embedding: queryEmbedding,
          match_threshold: filters?.threshold || 0.7,
          match_count: filters?.limit || 10
        });

      results.learning = learningData || [];
    }

    // If user is provided, update their search history and learning analytics
    if (userId) {
      // Track vocabulary exposure for personalized learning
      const vocabularyExposed = results.dictionary?.map((item: any) => item.goji_word) || [];
      
      if (vocabularyExposed.length > 0) {
        // Update vocabulary mastery tracking
        for (const word of vocabularyExposed.slice(0, 5)) { // Track top 5 results
          await supabase
            .from('vocabulary_mastery')
            .upsert({
              user_id: userId,
              dictionary_entry_id: results.dictionary.find((item: any) => item.goji_word === word)?.id,
              mastery_level: 'learning',
              learning_context: 'search_exposure'
            }, {
              onConflict: 'user_id,dictionary_entry_id'
            });
        }
      }
    }

    // Add intelligent suggestions based on search results
    const suggestions = await generateSearchSuggestions(supabase, query, results);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      query_embedding_length: queryEmbedding.length,
      suggestions,
      total_matches: {
        dictionary: results.dictionary?.length || 0,
        cultural: results.cultural?.length || 0,
        learning: results.learning?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-semantic-search function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSearchSuggestions(supabase: any, originalQuery: string, results: any) {
  const suggestions = {
    related_words: [],
    cultural_topics: [],
    learning_paths: []
  };

  // Extract related words from dictionary results
  if (results.dictionary) {
    suggestions.related_words = results.dictionary
      .slice(0, 3)
      .map((item: any) => ({
        goji: item.goji_word,
        english: item.english_translation,
        similarity: item.similarity
      }));
  }

  // Extract cultural topics
  if (results.cultural) {
    suggestions.cultural_topics = results.cultural
      .slice(0, 2)
      .map((item: any) => ({
        title: item.title,
        type: item.context_type,
        similarity: item.similarity
      }));
  }

  // Generate learning path suggestions based on difficulty progression
  if (results.dictionary && results.dictionary.length > 0) {
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const currentDifficulty = results.dictionary[0]?.difficulty_level || 'beginner';
    const nextLevel = difficulties[difficulties.indexOf(currentDifficulty) + 1];
    
    if (nextLevel) {
      suggestions.learning_paths.push({
        suggestion: `Ready to advance to ${nextLevel} level?`,
        action: `Search for ${nextLevel} level words related to "${originalQuery}"`,
        difficulty: nextLevel
      });
    }
  }

  return suggestions;
}