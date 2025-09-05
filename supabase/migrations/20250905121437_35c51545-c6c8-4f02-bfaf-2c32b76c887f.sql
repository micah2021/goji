-- Create a public community conversation for Goji language practice using 'general' type
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get the first existing user
    SELECT user_id INTO existing_user_id FROM profiles LIMIT 1;
    
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
        existing_user_id,
        'Goji Community Chat',
        'Practice Goji language with the community. Goji language only advised!',
        'general',
        true,
        now(),
        now()
    ) ON CONFLICT DO NOTHING;
END $$;

-- Add replica identity and realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;