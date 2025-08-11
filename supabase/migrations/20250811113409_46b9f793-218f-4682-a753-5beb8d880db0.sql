-- Fix search_path security issues in functions
CREATE OR REPLACE FUNCTION update_conversation_counters()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
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

CREATE OR REPLACE FUNCTION generate_learning_data()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
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