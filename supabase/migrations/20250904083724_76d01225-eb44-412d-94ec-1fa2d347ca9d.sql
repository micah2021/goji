-- Create a function to generate embeddings for existing dictionary entries
CREATE OR REPLACE FUNCTION generate_embeddings_for_dictionary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  entry_record RECORD;
  embedding_text TEXT;
BEGIN
  -- Loop through all dictionary entries that don't have embeddings
  FOR entry_record IN 
    SELECT id, goji_word, english_translation, hausa_translation, example_sentence, cultural_context
    FROM dictionary_entries 
    WHERE embedding IS NULL
  LOOP
    -- Create text for embedding generation
    embedding_text := entry_record.goji_word || ' ' || 
                     COALESCE(entry_record.english_translation, '') || ' ' ||
                     COALESCE(entry_record.hausa_translation, '') || ' ' ||
                     COALESCE(entry_record.example_sentence, '') || ' ' ||
                     COALESCE(entry_record.cultural_context, '');
    
    -- For now, we'll mark them as needing embeddings
    -- The embeddings will be generated via the edge function
    UPDATE dictionary_entries 
    SET last_updated = now()
    WHERE id = entry_record.id;
  END LOOP;
  
  -- Also create some sample cultural contexts
  INSERT INTO cultural_contexts (title, description, context_type, goji_content, english_content, difficulty_level, cultural_significance)
  VALUES 
  ('Gombe Counting System', 'Traditional counting method used in Gombe region', 'tradition', 'Goji counting: ɗoƙ, palou, tat, pereu, fuwat...', 'Traditional Goji numbers reflect ancient trading practices', 'beginner', 'Essential for understanding Goji commerce and daily life'),
  ('Greetings and Respect', 'How to properly greet elders and peers', 'social', 'Sannu da safe - Good morning greeting', 'Respectful greetings are central to Goji culture', 'beginner', 'Shows respect and maintains social harmony'),
  ('Market Terminology', 'Common words used in traditional markets', 'commerce', 'Market words for buying and selling', 'Essential vocabulary for daily commerce', 'intermediate', 'Critical for economic participation')
  ON CONFLICT (title) DO NOTHING;
  
  -- Add some AI learning data
  INSERT INTO ai_learning_data (data_type, content, learning_category, difficulty_level, language_pair, semantic_tags)
  VALUES 
  ('conversation', 'Learning Goji numbers is fundamental to daily communication', 'vocabulary', 'beginner', 'goji-english', ARRAY['numbers', 'counting', 'basics']),
  ('grammar_rule', 'Goji verbs typically follow subject-verb-object order', 'grammar', 'intermediate', 'goji-english', ARRAY['grammar', 'sentence_structure']),
  ('cultural_note', 'When counting animals like goats, Goji speakers use specific patterns', 'culture', 'beginner', 'goji-english', ARRAY['culture', 'animals', 'counting'])
  ON CONFLICT (content) DO NOTHING;
END;
$$;