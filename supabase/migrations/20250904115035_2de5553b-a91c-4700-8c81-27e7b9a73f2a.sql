-- Enhanced dictionary schema for Kushi wordlist import (simplified)
ALTER TABLE public.dictionary_entries 
ADD COLUMN IF NOT EXISTS part_of_speech text,
ADD COLUMN IF NOT EXISTS tone_marking text,
ADD COLUMN IF NOT EXISTS linguistic_notes text,
ADD COLUMN IF NOT EXISTS semantic_category text,
ADD COLUMN IF NOT EXISTS literal_translation text,
ADD COLUMN IF NOT EXISTS word_family text[],
ADD COLUMN IF NOT EXISTS cross_references uuid[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dictionary_part_of_speech ON public.dictionary_entries(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_dictionary_semantic_category ON public.dictionary_entries(semantic_category);

-- Update existing entries to have default values
UPDATE public.dictionary_entries 
SET part_of_speech = 'num', 
    semantic_category = 'numbers',
    difficulty_level = 'beginner'
WHERE part_of_speech IS NULL;

-- Create function to clean old demo data
CREATE OR REPLACE FUNCTION public.clear_demo_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear existing demo/number entries to make room for real Kushi data
  DELETE FROM dictionary_entries 
  WHERE goji_word IN ('ɗoƙ', 'palou', 'tat', 'pereu', 'fuwat', 'susuu', 'toolu', 'takanduu', 'tandu', 'goom');
END;
$$;