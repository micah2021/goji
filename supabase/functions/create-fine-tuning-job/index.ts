import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trainingFile } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set');
    }

    // Step 1: Upload training file
    const formData = new FormData();
    formData.append('purpose', 'fine-tune');
    formData.append('file', trainingFile);

    const uploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const uploadResult = await uploadResponse.json();
    console.log('File uploaded:', uploadResult);

    // Step 2: Create fine-tuning job
    const finetuneResponse = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        training_file: uploadResult.id,
        model: 'gpt-4o-mini-2024-07-18', // Base model to fine-tune
        hyperparameters: {
          n_epochs: 3,
        },
        suffix: 'goji-tutor',
      }),
    });

    const finetuneResult = await finetuneResponse.json();
    console.log('Fine-tuning job created:', finetuneResult);

    return new Response(JSON.stringify({
      message: 'Fine-tuning job created successfully',
      job_id: finetuneResult.id,
      status: finetuneResult.status,
      file_id: uploadResult.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating fine-tuning job:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});