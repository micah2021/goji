import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting embedding generation process...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all dictionary entries without embeddings
    const { data: entries, error: fetchError } = await supabase
      .from('dictionary_entries')
      .select('id, goji_word, english_translation, hausa_translation, example_sentence, cultural_context')
      .is('embedding', null);

    if (fetchError) {
      throw new Error(`Failed to fetch entries: ${fetchError.message}`);
    }

    console.log(`Found ${entries.length} entries without embeddings`);

    let processedCount = 0;
    const batchSize = 5; // Process in small batches to avoid rate limits

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      for (const entry of batch) {
        try {
          // Create text for embedding
          const embeddingText = [
            entry.goji_word,
            entry.english_translation || '',
            entry.hausa_translation || '',
            entry.example_sentence || '',
            entry.cultural_context || ''
          ].filter(Boolean).join(' ');

          console.log(`Generating embedding for: ${entry.goji_word}`);
          
          const embedding = await generateEmbedding(embeddingText);

          // Update the entry with the embedding
          const { error: updateError } = await supabase
            .from('dictionary_entries')
            .update({ embedding })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`Failed to update entry ${entry.id}:`, updateError);
          } else {
            processedCount++;
            console.log(`Updated ${entry.goji_word} with embedding`);
          }

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing entry ${entry.goji_word}:`, error);
        }
      }

      // Longer delay between batches
      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate embeddings for cultural contexts
    const { data: culturalEntries, error: culturalFetchError } = await supabase
      .from('cultural_contexts')
      .select('id, title, description, goji_content, english_content')
      .is('embedding', null);

    if (culturalEntries && culturalEntries.length > 0) {
      for (const entry of culturalEntries) {
        try {
          const embeddingText = [
            entry.title,
            entry.description,
            entry.goji_content || '',
            entry.english_content || ''
          ].filter(Boolean).join(' ');

          const embedding = await generateEmbedding(embeddingText);

          await supabase
            .from('cultural_contexts')
            .update({ embedding })
            .eq('id', entry.id);

          console.log(`Updated cultural context: ${entry.title}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing cultural context ${entry.title}:`, error);
        }
      }
    }

    // Generate embeddings for AI learning data
    const { data: learningEntries } = await supabase
      .from('ai_learning_data')
      .select('id, content, learning_category, semantic_tags')
      .is('embedding', null);

    if (learningEntries && learningEntries.length > 0) {
      for (const entry of learningEntries) {
        try {
          const embeddingText = [
            entry.content,
            entry.learning_category || '',
            (entry.semantic_tags || []).join(' ')
          ].filter(Boolean).join(' ');

          const embedding = await generateEmbedding(embeddingText);

          await supabase
            .from('ai_learning_data')
            .update({ embedding })
            .eq('id', entry.id);

          console.log(`Updated AI learning data: ${entry.content.substring(0, 50)}...`);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing learning data:`, error);
        }
      }
    }

    console.log(`Embedding generation complete. Processed ${processedCount} dictionary entries.`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedCount,
      total: entries.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-embeddings:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});