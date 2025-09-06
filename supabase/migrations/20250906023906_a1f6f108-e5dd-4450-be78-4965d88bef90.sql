-- Delete the mission recording from audio_recordings table
DELETE FROM public.audio_recordings 
WHERE id = 'a9902baf-3fa8-4ea5-a4e3-945d8beb368b';

-- Delete the audio file from storage
SELECT storage.delete_object('chat-audio', 'elder-recordings/1757124517078-0cwmq94jw.mp3');