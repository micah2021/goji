-- Create a public community conversation for Goji language practice
INSERT INTO conversations (
  id,
  creator_id,
  title,
  description,
  conversation_type,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  NULL, -- No specific creator for community chat
  'Goji Community Chat',
  'Practice Goji language with the community. Goji language only!',
  'public',
  true,
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Add replica identity and realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;