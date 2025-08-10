-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('word', 'phrase', 'story')),
  goji_text TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  hausa_translation TEXT,
  example_sentence TEXT,
  cultural_context TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Create policies for contributions
CREATE POLICY "Contributions are viewable by everyone" 
ON public.contributions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create contributions" 
ON public.contributions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions" 
ON public.contributions 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Create votes table
CREATE TABLE public.contribution_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contribution_id UUID NOT NULL REFERENCES public.contributions(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, contribution_id)
);

-- Enable RLS
ALTER TABLE public.contribution_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for votes
CREATE POLICY "Votes are viewable by everyone" 
ON public.contribution_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create votes" 
ON public.contribution_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
ON public.contribution_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create approved dictionary entries table
CREATE TABLE public.dictionary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_id UUID NOT NULL REFERENCES public.contributions(id),
  goji_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  hausa_translation TEXT,
  example_sentence TEXT,
  cultural_context TEXT,
  contributor_id UUID NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for dictionary entries
CREATE POLICY "Dictionary entries are viewable by everyone" 
ON public.dictionary_entries 
FOR SELECT 
USING (true);

-- Create approved stories table
CREATE TABLE public.approved_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_id UUID NOT NULL REFERENCES public.contributions(id),
  title TEXT NOT NULL,
  goji_text TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  hausa_translation TEXT,
  cultural_context TEXT,
  contributor_id UUID NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approved_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for approved stories
CREATE POLICY "Approved stories are viewable by everyone" 
ON public.approved_stories 
FOR SELECT 
USING (true);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_contribution_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.contributions SET
      votes_for = (SELECT COUNT(*) FROM public.contribution_votes WHERE contribution_id = NEW.contribution_id AND vote_type = 'for'),
      votes_against = (SELECT COUNT(*) FROM public.contribution_votes WHERE contribution_id = NEW.contribution_id AND vote_type = 'against'),
      updated_at = now()
    WHERE id = NEW.contribution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contributions SET
      votes_for = (SELECT COUNT(*) FROM public.contribution_votes WHERE contribution_id = OLD.contribution_id AND vote_type = 'for'),
      votes_against = (SELECT COUNT(*) FROM public.contribution_votes WHERE contribution_id = OLD.contribution_id AND vote_type = 'against'),
      updated_at = now()
    WHERE id = OLD.contribution_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote updates
CREATE TRIGGER update_contribution_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.contribution_votes
FOR EACH ROW EXECUTE FUNCTION update_contribution_votes();

-- Function to award points and approve contributions
CREATE OR REPLACE FUNCTION approve_contribution(contribution_id UUID)
RETURNS VOID AS $$
DECLARE
  contrib_record public.contributions%ROWTYPE;
BEGIN
  -- Get contribution details
  SELECT * INTO contrib_record FROM public.contributions WHERE id = contribution_id;
  
  IF contrib_record.id IS NOT NULL AND contrib_record.status = 'pending' THEN
    -- Update contribution status
    UPDATE public.contributions SET status = 'approved' WHERE id = contribution_id;
    
    -- Award points to contributor
    INSERT INTO public.profiles (user_id, points) 
    VALUES (contrib_record.user_id, 10)
    ON CONFLICT (user_id) 
    DO UPDATE SET points = profiles.points + 10;
    
    -- Move to appropriate archive table
    IF contrib_record.type = 'word' OR contrib_record.type = 'phrase' THEN
      INSERT INTO public.dictionary_entries (
        contribution_id, goji_word, english_translation, hausa_translation, 
        example_sentence, cultural_context, contributor_id
      ) VALUES (
        contrib_record.id, contrib_record.goji_text, contrib_record.english_translation,
        contrib_record.hausa_translation, contrib_record.example_sentence,
        contrib_record.cultural_context, contrib_record.user_id
      );
    ELSIF contrib_record.type = 'story' THEN
      INSERT INTO public.approved_stories (
        contribution_id, title, goji_text, english_translation, hausa_translation,
        cultural_context, contributor_id
      ) VALUES (
        contrib_record.id, contrib_record.goji_text, contrib_record.goji_text,
        contrib_record.english_translation, contrib_record.hausa_translation,
        contrib_record.cultural_context, contrib_record.user_id
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at
BEFORE UPDATE ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();