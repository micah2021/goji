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

// Generate embeddings for new entries
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

// Validate and enhance word entries using AI
async function validateAndEnhanceEntry(entry: any) {
  const prompt = `Validate and enhance this Goji language dictionary entry:

Goji Word: ${entry.goji_word}
English: ${entry.english_translation || 'not provided'}
Hausa: ${entry.hausa_translation || 'not provided'}
Example: ${entry.example_sentence || 'not provided'}
Cultural Context: ${entry.cultural_context || 'not provided'}

Please provide:
1. Validation status (valid/invalid/needs_review)
2. Enhanced translations if missing
3. Pronunciation guide in IPA
4. Difficulty level (beginner/intermediate/advanced)
5. Usage frequency estimate (1-10)
6. Cultural significance notes
7. Any corrections needed

Return as JSON with fields: validation_status, enhanced_english, enhanced_hausa, pronunciation_guide, difficulty_level, usage_frequency, cultural_significance, corrections_needed`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert in Goji language and culture. Provide accurate linguistic analysis.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, entries, batchId, userId } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'upload') {
      // Process and validate entries
      const batchUuid = batchId || crypto.randomUUID();
      const processedEntries = [];

      for (const entry of entries) {
        try {
          // Validate and enhance entry using AI
          const validation = await validateAndEnhanceEntry(entry);
          
          const processedEntry = {
            batch_id: batchUuid,
            goji_word: entry.goji_word.trim(),
            english_translation: validation.enhanced_english || entry.english_translation,
            hausa_translation: validation.enhanced_hausa || entry.hausa_translation,
            example_sentence: entry.example_sentence,
            cultural_context: validation.cultural_significance || entry.cultural_context,
            pronunciation_guide: validation.pronunciation_guide,
            category: entry.category || 'general',
            difficulty_level: validation.difficulty_level || 'beginner',
            source_document: entry.source_document || 'bulk_import',
            import_status: validation.validation_status === 'valid' ? 'validated' : 'needs_review',
            validation_errors: validation.corrections_needed ? [validation.corrections_needed] : [],
            imported_by: userId
          };

          processedEntries.push(processedEntry);
        } catch (error) {
          console.error(`Error processing entry ${entry.goji_word}:`, error);
          processedEntries.push({
            ...entry,
            batch_id: batchUuid,
            import_status: 'error',
            validation_errors: [`Processing error: ${error.message}`],
            imported_by: userId
          });
        }
      }

      // Insert into staging table
      const { data, error } = await supabase
        .from('dictionary_import_staging')
        .insert(processedEntries)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        batch_id: batchUuid,
        processed_count: processedEntries.length,
        validated_count: processedEntries.filter(e => e.import_status === 'validated').length,
        needs_review_count: processedEntries.filter(e => e.import_status === 'needs_review').length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'approve_batch') {
      // Move validated entries from staging to dictionary_entries
      const { data: stagingEntries, error: fetchError } = await supabase
        .from('dictionary_import_staging')
        .select('*')
        .eq('batch_id', batchId)
        .eq('import_status', 'validated');

      if (fetchError) throw fetchError;

      const dictionaryEntries = [];
      for (const entry of stagingEntries) {
        // Generate embedding for semantic search
        const embeddingText = `${entry.goji_word} ${entry.english_translation} ${entry.hausa_translation} ${entry.cultural_context || ''}`;
        const embedding = await generateEmbedding(embeddingText);

        dictionaryEntries.push({
          goji_word: entry.goji_word,
          english_translation: entry.english_translation,
          hausa_translation: entry.hausa_translation,
          example_sentence: entry.example_sentence,
          cultural_context: entry.cultural_context,
          pronunciation_guide: entry.pronunciation_guide,
          difficulty_level: entry.difficulty_level,
          embedding: embedding,
          usage_frequency: 1,
          audio_quality_score: 0.0,
          contributor_id: entry.imported_by,
          contribution_id: crypto.randomUUID(),
          approved_at: new Date().toISOString()
        });
      }

      // Insert into dictionary_entries
      const { error: insertError } = await supabase
        .from('dictionary_entries')
        .insert(dictionaryEntries);

      if (insertError) throw insertError;

      // Update staging status
      const { error: updateError } = await supabase
        .from('dictionary_import_staging')
        .update({ import_status: 'approved' })
        .eq('batch_id', batchId)
        .eq('import_status', 'validated');

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ 
        success: true, 
        approved_count: dictionaryEntries.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_batches') {
      // Get all import batches for review
      const { data, error } = await supabase
        .from('dictionary_import_staging')
        .select('batch_id, import_status, created_at, imported_by, goji_word, english_translation')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by batch_id
      const batches = data.reduce((acc: any, entry: any) => {
        if (!acc[entry.batch_id]) {
          acc[entry.batch_id] = {
            batch_id: entry.batch_id,
            created_at: entry.created_at,
            imported_by: entry.imported_by,
            entries: [],
            status_counts: {}
          };
        }
        acc[entry.batch_id].entries.push(entry);
        acc[entry.batch_id].status_counts[entry.import_status] = 
          (acc[entry.batch_id].status_counts[entry.import_status] || 0) + 1;
        return acc;
      }, {});

      return new Response(JSON.stringify({ 
        success: true, 
        batches: Object.values(batches)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in bulk-dictionary-import function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});