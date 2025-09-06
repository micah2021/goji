-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'post', -- 'post', 'tip', 'achievement', 'question'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create post replies table
CREATE TABLE public.post_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.post_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reply likes table
CREATE TABLE public.reply_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reply_id UUID NOT NULL REFERENCES public.post_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reply_id)
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL, -- 'vocabulary_master', 'community_contributor', 'streak_keeper', etc.
  achievement_level INTEGER DEFAULT 1, -- Bronze(1), Silver(2), Gold(3), Diamond(4)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type, achievement_level)
);

-- Create community stats view
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
  COUNT(DISTINCT cp.user_id) as total_contributors,
  COUNT(cp.id) as total_posts,
  COUNT(pr.id) as total_replies,
  COUNT(pl.id) as total_likes,
  COUNT(CASE WHEN cp.created_at > now() - interval '7 days' THEN 1 END) as posts_this_week,
  COUNT(CASE WHEN cp.created_at > now() - interval '24 hours' THEN 1 END) as posts_today
FROM public.community_posts cp
LEFT JOIN public.post_replies pr ON pr.post_id = cp.id
LEFT JOIN public.post_likes pl ON pl.post_id = cp.id;

-- Create leaderboard view
CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  COALESCE(p.points, 0) as total_points,
  COALESCE(lp.vocabulary_mastery_count, 0) as words_mastered,
  COALESCE(lp.streak_days, 0) as current_streak,
  COALESCE(post_stats.posts_count, 0) as posts_count,
  COALESCE(post_stats.likes_received, 0) as likes_received,
  COALESCE(contrib_stats.contributions_approved, 0) as contributions_approved,
  COALESCE(achievements_stats.achievements_count, 0) as achievements_count,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.points, 0) DESC, COALESCE(lp.vocabulary_mastery_count, 0) DESC) as rank
FROM public.profiles p
LEFT JOIN public.learner_profiles lp ON lp.user_id = p.user_id
LEFT JOIN (
  SELECT 
    cp.user_id,
    COUNT(cp.id) as posts_count,
    SUM(cp.likes_count) as likes_received
  FROM public.community_posts cp
  GROUP BY cp.user_id
) post_stats ON post_stats.user_id = p.user_id
LEFT JOIN (
  SELECT 
    c.user_id,
    COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as contributions_approved
  FROM public.contributions c
  GROUP BY c.user_id
) contrib_stats ON contrib_stats.user_id = p.user_id
LEFT JOIN (
  SELECT 
    ua.user_id,
    COUNT(ua.id) as achievements_count
  FROM public.user_achievements ua
  GROUP BY ua.user_id
) achievements_stats ON achievements_stats.user_id = p.user_id
WHERE p.user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Post likes policies
CREATE POLICY "Anyone can view post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post replies policies
CREATE POLICY "Anyone can view post replies" ON public.post_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.post_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON public.post_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON public.post_replies FOR DELETE USING (auth.uid() = user_id);

-- Reply likes policies
CREATE POLICY "Anyone can view reply likes" ON public.reply_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like replies" ON public.reply_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own reply likes" ON public.reply_likes FOR DELETE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Anyone can view achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can create achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Create triggers to update counters
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET replies_count = GREATEST(replies_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.post_replies 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_replies 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER post_likes_counter_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER post_replies_counter_trigger
  AFTER INSERT OR DELETE ON public.post_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_replies_count();

CREATE TRIGGER reply_likes_counter_trigger
  AFTER INSERT OR DELETE ON public.reply_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_reply_likes_count();

-- Function to award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(user_id_param UUID)
RETURNS void AS $$
DECLARE
  vocab_count INTEGER;
  posts_count INTEGER;
  contrib_count INTEGER;
  streak_days INTEGER;
BEGIN
  -- Get user stats
  SELECT vocabulary_mastery_count, streak_days INTO vocab_count, streak_days
  FROM learner_profiles WHERE user_id = user_id_param;
  
  SELECT COUNT(*) INTO posts_count
  FROM community_posts WHERE user_id = user_id_param;
  
  SELECT COUNT(*) INTO contrib_count
  FROM contributions WHERE user_id = user_id_param AND status = 'approved';
  
  -- Award vocabulary achievements
  IF vocab_count >= 100 AND NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = user_id_param AND achievement_type = 'vocabulary_master' AND achievement_level = 1
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_level, title, description, icon, points_earned)
    VALUES (user_id_param, 'vocabulary_master', 1, 'Word Explorer', 'Mastered 100 Goji words', '🗣️', 50);
  END IF;
  
  -- Award community achievements
  IF posts_count >= 10 AND NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = user_id_param AND achievement_type = 'community_contributor' AND achievement_level = 1
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_level, title, description, icon, points_earned)
    VALUES (user_id_param, 'community_contributor', 1, 'Community Voice', 'Shared 10 posts with the community', '💬', 30);
  END IF;
  
  -- Award streak achievements
  IF streak_days >= 7 AND NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = user_id_param AND achievement_type = 'streak_keeper' AND achievement_level = 1
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_level, title, description, icon, points_earned)
    VALUES (user_id_param, 'streak_keeper', 1, 'Consistent Learner', 'Maintained a 7-day learning streak', '🔥', 25);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;