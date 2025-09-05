-- Create a system UUID for community features
DO $$
DECLARE
    system_user_id UUID := '00000000-0000-0000-0000-000000000001';
    existing_user_id UUID;
BEGIN
    -- Try to get the first existing user, or use system ID
    SELECT user_id INTO existing_user_id FROM profiles LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        existing_user_id := system_user_id;
    END IF;
    
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
        'public',
        true,
        now(),
        now()
    ) ON CONFLICT DO NOTHING;
END $$;

-- Add replica identity and realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;