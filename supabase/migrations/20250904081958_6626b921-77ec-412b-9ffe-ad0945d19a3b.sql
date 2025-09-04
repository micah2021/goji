-- Create semantic search functions for enhanced RAG capabilities

-- Function to search dictionary entries using vector similarity
CREATE OR REPLACE FUNCTION match_dictionary_entries(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  goji_word text,
  english_translation text,
  hausa_translation text,
  example_sentence text,
  cultural_context text,
  pronunciation_guide text,
  difficulty_level text,
  usage_frequency int,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    dictionary_entries.id,
    dictionary_entries.goji_word,
    dictionary_entries.english_translation,
    dictionary_entries.hausa_translation,
    dictionary_entries.example_sentence,
    dictionary_entries.cultural_context,
    dictionary_entries.pronunciation_guide,
    dictionary_entries.difficulty_level,
    dictionary_entries.usage_frequency,
    1 - (dictionary_entries.embedding <=> query_embedding) AS similarity
  FROM dictionary_entries
  WHERE dictionary_entries.embedding IS NOT NULL
    AND 1 - (dictionary_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY dictionary_entries.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to search cultural contexts using vector similarity  
CREATE OR REPLACE FUNCTION match_cultural_contexts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  context_type text,
  goji_content text,
  english_content text,
  hausa_content text,
  cultural_significance text,
  geographical_region text,
  clan_associations text[],
  difficulty_level text,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    cultural_contexts.id,
    cultural_contexts.title,
    cultural_contexts.description,
    cultural_contexts.context_type,
    cultural_contexts.goji_content,
    cultural_contexts.english_content,
    cultural_contexts.hausa_content,
    cultural_contexts.cultural_significance,
    cultural_contexts.geographical_region,
    cultural_contexts.clan_associations,
    cultural_contexts.difficulty_level,
    1 - (cultural_contexts.embedding <=> query_embedding) AS similarity
  FROM cultural_contexts
  WHERE cultural_contexts.embedding IS NOT NULL
    AND 1 - (cultural_contexts.embedding <=> query_embedding) > match_threshold
  ORDER BY cultural_contexts.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to search AI learning data using vector similarity
CREATE OR REPLACE FUNCTION match_learning_data(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  data_type text,
  content text,
  learning_category text,
  difficulty_level text,
  language_pair text,
  quality_score numeric,
  semantic_tags text[],
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    ai_learning_data.id,
    ai_learning_data.data_type,
    ai_learning_data.content,
    ai_learning_data.learning_category,
    ai_learning_data.difficulty_level,
    ai_learning_data.language_pair,
    ai_learning_data.quality_score,
    ai_learning_data.semantic_tags,
    1 - (ai_learning_data.embedding <=> query_embedding) AS similarity
  FROM ai_learning_data
  WHERE ai_learning_data.embedding IS NOT NULL
    AND 1 - (ai_learning_data.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_learning_data.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to get learner progress statistics
CREATE OR REPLACE FUNCTION get_learner_progress(learner_user_id uuid)
RETURNS TABLE (
  vocabulary_mastered int,
  vocabulary_learning int,
  vocabulary_familiar int,
  average_pronunciation_score numeric,
  total_study_time_minutes int,
  streak_days int,
  preferred_topics text[],
  improvement_areas text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN vm.mastery_level = 'mastered' THEN 1 ELSE 0 END), 0)::int as vocabulary_mastered,
    COALESCE(SUM(CASE WHEN vm.mastery_level = 'learning' THEN 1 ELSE 0 END), 0)::int as vocabulary_learning,
    COALESCE(SUM(CASE WHEN vm.mastery_level = 'familiar' THEN 1 ELSE 0 END), 0)::int as vocabulary_familiar,
    COALESCE(AVG(vm.confidence_score), 0) as average_pronunciation_score,
    COALESCE(lp.total_study_time_minutes, 0) as total_study_time_minutes,
    COALESCE(lp.streak_days, 0) as streak_days,
    COALESCE(lp.cultural_interests, '{}') as preferred_topics,
    COALESCE(lp.weaknesses, '{}') as improvement_areas
  FROM vocabulary_mastery vm
  RIGHT JOIN learner_profiles lp ON lp.user_id = learner_user_id
  WHERE vm.user_id = learner_user_id OR vm.user_id IS NULL
  GROUP BY lp.total_study_time_minutes, lp.streak_days, lp.cultural_interests, lp.weaknesses;
$$;

-- Function to update vocabulary mastery based on practice session
CREATE OR REPLACE FUNCTION update_vocabulary_mastery(
  learner_user_id uuid,
  word_id uuid,
  was_correct boolean,
  response_time_ms int,
  pronunciation_score numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_mastery record;
  new_confidence numeric;
  new_mastery_level text;
BEGIN
  -- Get current mastery record
  SELECT * INTO current_mastery
  FROM vocabulary_mastery 
  WHERE user_id = learner_user_id AND dictionary_entry_id = word_id;
  
  -- Calculate new confidence score
  IF current_mastery.id IS NOT NULL THEN
    -- Update existing record
    new_confidence := current_mastery.confidence_score;
    
    IF was_correct THEN
      new_confidence := LEAST(1.0, new_confidence + 0.1);
    ELSE
      new_confidence := GREATEST(0.0, new_confidence - 0.05);
    END IF;
    
    -- Determine new mastery level
    IF new_confidence >= 0.8 THEN
      new_mastery_level := 'mastered';
    ELSIF new_confidence >= 0.5 THEN
      new_mastery_level := 'familiar';
    ELSE
      new_mastery_level := 'learning';
    END IF;
    
    -- Update the record
    UPDATE vocabulary_mastery SET
      mastery_level = new_mastery_level,
      confidence_score = new_confidence,
      correct_attempts = correct_attempts + CASE WHEN was_correct THEN 1 ELSE 0 END,
      total_attempts = total_attempts + 1,
      last_practiced = now(),
      pronunciation_scores = CASE 
        WHEN pronunciation_score IS NOT NULL THEN 
          pronunciation_scores || pronunciation_score 
        ELSE pronunciation_scores 
      END,
      response_times_ms = response_times_ms || response_time_ms,
      updated_at = now()
    WHERE id = current_mastery.id;
  ELSE
    -- Create new record
    new_confidence := CASE WHEN was_correct THEN 0.3 ELSE 0.1 END;
    new_mastery_level := 'learning';
    
    INSERT INTO vocabulary_mastery (
      user_id, dictionary_entry_id, mastery_level, confidence_score,
      correct_attempts, total_attempts, pronunciation_scores, response_times_ms
    ) VALUES (
      learner_user_id, word_id, new_mastery_level, new_confidence,
      CASE WHEN was_correct THEN 1 ELSE 0 END, 1,
      CASE WHEN pronunciation_score IS NOT NULL THEN ARRAY[pronunciation_score] ELSE '{}' END,
      ARRAY[response_time_ms]
    );
  END IF;
  
  -- Update learner profile vocabulary count
  UPDATE learner_profiles SET 
    vocabulary_mastery_count = (
      SELECT COUNT(*) FROM vocabulary_mastery 
      WHERE user_id = learner_user_id AND mastery_level IN ('familiar', 'mastered')
    ),
    updated_at = now()
  WHERE user_id = learner_user_id;
END;
$$;

-- Function to get personalized word recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  learner_user_id uuid,
  recommendation_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  goji_word text,
  english_translation text,
  hausa_translation text,
  difficulty_level text,
  recommendation_reason text,
  priority_score numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH learner_stats AS (
    SELECT 
      learning_level,
      cultural_interests,
      weaknesses
    FROM learner_profiles 
    WHERE user_id = learner_user_id
  ),
  unmastered_words AS (
    SELECT de.*, ls.learning_level, ls.cultural_interests, ls.weaknesses
    FROM dictionary_entries de
    CROSS JOIN learner_stats ls
    LEFT JOIN vocabulary_mastery vm ON vm.dictionary_entry_id = de.id AND vm.user_id = learner_user_id
    WHERE vm.id IS NULL OR vm.mastery_level = 'learning'
  )
  SELECT 
    uw.id,
    uw.goji_word,
    uw.english_translation,
    uw.hausa_translation,
    uw.difficulty_level,
    CASE 
      WHEN uw.difficulty_level = uw.learning_level THEN 'Matches your current level'
      WHEN uw.usage_frequency > 5 THEN 'High frequency word'
      ELSE 'Recommended for practice'
    END as recommendation_reason,
    (
      CASE WHEN uw.difficulty_level = uw.learning_level THEN 3.0 ELSE 1.0 END +
      CASE WHEN uw.usage_frequency > 5 THEN 2.0 ELSE 0.0 END +
      CASE WHEN array_length(uw.cultural_interests, 1) > 0 THEN 1.0 ELSE 0.0 END
    ) as priority_score
  FROM unmastered_words uw
  ORDER BY priority_score DESC, uw.usage_frequency DESC
  LIMIT recommendation_count;
$$;