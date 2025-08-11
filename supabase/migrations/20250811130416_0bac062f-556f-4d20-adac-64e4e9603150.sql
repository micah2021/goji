-- Fix security issues in existing functions by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update message count for conversations
  IF TG_OP = 'INSERT' THEN
    UPDATE public.conversations 
    SET message_count = message_count + 1,
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.conversations 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_learning_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Generate learning data for text messages
  IF NEW.text IS NOT NULL AND NEW.text != '[Audio Message]' THEN
    INSERT INTO public.ai_learning_data (
      conversation_id,
      message_id,
      data_type,
      content,
      metadata,
      learning_category,
      language_pair
    ) VALUES (
      NEW.conversation_id,
      NEW.id,
      'text',
      NEW.text,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'tags', NEW.tags,
        'created_at', NEW.created_at
      ),
      'conversation',
      'goji-english'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Improve the approve_contribution function to always add words to dictionary
CREATE OR REPLACE FUNCTION public.approve_contribution(contribution_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contrib_record public.contributions%ROWTYPE;
BEGIN
  -- Get contribution details
  SELECT * INTO contrib_record FROM public.contributions WHERE id = contribution_id;
  
  IF contrib_record.id IS NOT NULL AND contrib_record.status = 'pending' THEN
    -- Update contribution status to approved
    UPDATE public.contributions 
    SET status = 'approved', updated_at = now() 
    WHERE id = contribution_id;
    
    -- Award points to contributor
    INSERT INTO public.profiles (user_id, points) 
    VALUES (contrib_record.user_id, 10)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = profiles.points + 10,
      updated_at = now();
    
    -- Always add words/phrases to dictionary when approved
    IF contrib_record.type = 'word' OR contrib_record.type = 'phrase' THEN
      INSERT INTO public.dictionary_entries (
        contribution_id, 
        goji_word, 
        english_translation, 
        hausa_translation, 
        example_sentence, 
        cultural_context, 
        contributor_id,
        approved_at,
        created_at
      ) VALUES (
        contrib_record.id, 
        contrib_record.goji_text, 
        contrib_record.english_translation,
        contrib_record.hausa_translation, 
        contrib_record.example_sentence,
        contrib_record.cultural_context, 
        contrib_record.user_id,
        now(),
        now()
      );
    ELSIF contrib_record.type = 'story' THEN
      -- Add stories to approved stories table
      INSERT INTO public.approved_stories (
        contribution_id, 
        title, 
        goji_text, 
        english_translation, 
        hausa_translation,
        cultural_context, 
        contributor_id,
        approved_at,
        created_at
      ) VALUES (
        contrib_record.id, 
        contrib_record.goji_text, 
        contrib_record.goji_text,
        contrib_record.english_translation, 
        contrib_record.hausa_translation,
        contrib_record.cultural_context, 
        contrib_record.user_id,
        now(),
        now()
      );
    END IF;
  END IF;
END;
$$;

-- Create a trigger to automatically approve contributions with enough positive votes
CREATE OR REPLACE FUNCTION public.auto_approve_contributions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contrib_record public.contributions%ROWTYPE;
  vote_threshold INTEGER := 3; -- Require 3 positive votes for auto-approval
BEGIN
  -- Get the updated contribution
  SELECT * INTO contrib_record 
  FROM public.contributions 
  WHERE id = NEW.contribution_id;
  
  -- Auto-approve if enough positive votes and still pending
  IF contrib_record.status = 'pending' 
     AND contrib_record.votes_for >= vote_threshold 
     AND contrib_record.votes_against = 0 THEN
    
    -- Call the approve function
    PERFORM public.approve_contribution(contrib_record.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-approval on vote updates
DROP TRIGGER IF EXISTS auto_approve_on_votes ON public.contributions;
CREATE TRIGGER auto_approve_on_votes
  AFTER UPDATE OF votes_for, votes_against ON public.contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_contributions();

-- Create a function to manually approve a single contribution by ID
CREATE OR REPLACE FUNCTION public.manually_approve_contribution(contribution_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Call the approve function
  PERFORM public.approve_contribution(contribution_id);
  
  -- Return success message
  SELECT json_build_object(
    'success', true,
    'message', 'Contribution approved and added to dictionary',
    'contribution_id', contribution_id
  ) INTO result;
  
  RETURN result;
END;
$$;