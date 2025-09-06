-- Remove inappropriate dictionary entries containing "gùn" meaning anus
DELETE FROM public.dictionary_entries 
WHERE id IN (
  '64d383ab-203a-430d-ab71-652b7b89dc74', -- gùn (anus)
  '7df7530d-675f-4d98-9c0d-54123878c17c', -- fɔ̀ gùn (anus)
  'ce765c76-2631-4d06-a0f1-f72e31fe753a'  -- fɔ̀ gùn (anus)
);

-- Note: We're keeping legitimate words like "àn gùnùl" (priest) and "gùngù" (lame)
-- as these are different words that happen to contain similar letter combinations