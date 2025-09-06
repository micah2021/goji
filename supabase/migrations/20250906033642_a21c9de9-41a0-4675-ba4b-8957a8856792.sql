-- Insert sample community posts to showcase the system
INSERT INTO public.community_posts (user_id, post_type, title, content, tags, created_at) VALUES
(
  (SELECT user_id FROM profiles LIMIT 1),
  'tip',
  'Learning Tip: Memory Palace Technique',
  'I''ve been using the memory palace technique for Goji vocabulary. I imagine walking through my grandmother''s compound and placing objects there. "àɗò" (eye) goes near the mirror, "àlàw" (leaf) in the garden. Try it!',
  ARRAY['tip', 'memory', 'vocabulary'],
  now() - interval '2 hours'
),
(
  (SELECT user_id FROM profiles LIMIT 1),
  'question',
  'Pronunciation Help Needed',
  'Can someone help me with the tone marking in "àɗéewè"? Is it rising or falling tone on the second syllable? The audio examples would be really helpful!',
  ARRAY['pronunciation', 'help', 'tones'],
  now() - interval '4 hours'
),
(
  (SELECT user_id FROM profiles LIMIT 1),
  'achievement',
  'First Milestone Reached!',
  'Just completed my first 10 words in the Goji dictionary! The "Basic Things" lesson was really helpful. Looking forward to learning more cultural context.',
  ARRAY['achievement', 'milestone'],
  now() - interval '6 hours'
);

-- Insert sample achievements
INSERT INTO public.user_achievements (user_id, achievement_type, achievement_level, title, description, icon, points_earned, unlocked_at) VALUES
(
  (SELECT user_id FROM profiles LIMIT 1),
  'vocabulary_master',
  1,
  'Word Explorer',
  'Learned your first 10 Goji words',
  '🗣️',
  25,
  now() - interval '1 hour'
),
(
  (SELECT user_id FROM profiles LIMIT 1),
  'community_contributor',
  1,
  'Community Voice',
  'Shared your first post with the community',
  '💬',
  15,
  now() - interval '3 hours'
),
(
  (SELECT user_id FROM profiles LIMIT 1),
  'streak_keeper',
  1,
  'Consistent Learner',
  'Maintained a 3-day learning streak',
  '🔥',
  20,
  now() - interval '12 hours'
);

-- Add some likes to posts
INSERT INTO public.post_likes (user_id, post_id, created_at) VALUES
(
  (SELECT user_id FROM profiles LIMIT 1),
  (SELECT id FROM community_posts LIMIT 1),
  now() - interval '1 hour'
);