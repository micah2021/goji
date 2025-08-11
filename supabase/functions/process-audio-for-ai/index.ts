import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioRecordingId } = await req.json();
    
    if (!audioRecordingId) {
      throw new Error('Audio recording ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get audio recording details
    const { data: audioRecord, error: fetchError } = await supabase
      .from('audio_recordings')
      .select('*')
      .eq('id', audioRecordingId)
      .single();

    if (fetchError || !audioRecord) {
      throw new Error('Audio recording not found');
    }

    // Update status to processing
    await supabase
      .from('audio_recordings')
      .update({ processing_status: 'processing' })
      .eq('id', audioRecordingId);

    // Download audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('chat-audio')
      .download(audioRecord.file_url.split('/').pop()!);

    if (downloadError || !audioData) {
      throw new Error('Failed to download audio file');
    }

    // Convert blob to base64 for OpenAI API
    const arrayBuffer = await audioData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binary);

    // Prepare form data for OpenAI Whisper API
    const formData = new FormData();
    const blob = new Blob([uint8Array], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Can be detected automatically
    formData.append('response_format', 'verbose_json');

    // Call OpenAI Whisper API for transcription
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${await openaiResponse.text()}`);
    }

    const transcriptionResult = await openaiResponse.json();
    
    // Analyze transcription with GPT for language learning insights
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert in language learning and the Goji language. Analyze the following transcription and provide insights for language learning purposes. Return JSON with:
            - language_detected: detected language
            - pronunciation_score: 0-1 score based on clarity
            - learning_category: vocabulary/grammar/pronunciation/conversation/cultural
            - difficulty_level: beginner/intermediate/advanced
            - key_phrases: array of important phrases
            - cultural_context: any cultural insights
            - improvement_suggestions: array of suggestions`
          },
          {
            role: 'user',
            content: `Transcription: "${transcriptionResult.text}"\nDuration: ${audioRecord.duration_seconds}s`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const analysisResult = await analysisResponse.json();
    const aiAnalysis = JSON.parse(analysisResult.choices[0].message.content);

    // Update audio recording with transcription and analysis
    const { error: updateError } = await supabase
      .from('audio_recordings')
      .update({
        transcription: transcriptionResult.text,
        transcription_confidence: transcriptionResult.segments?.[0]?.confidence || 0.8,
        language_detected: aiAnalysis.language_detected,
        pronunciation_score: aiAnalysis.pronunciation_score,
        ai_analysis: aiAnalysis,
        processing_status: 'completed'
      })
      .eq('id', audioRecordingId);

    if (updateError) {
      throw new Error('Failed to update audio recording');
    }

    // Create AI learning data entries
    await supabase
      .from('ai_learning_data')
      .insert([
        {
          audio_recording_id: audioRecordingId,
          conversation_id: audioRecord.conversation_id,
          data_type: 'audio',
          content: transcriptionResult.text,
          metadata: {
            duration: audioRecord.duration_seconds,
            confidence: transcriptionResult.segments?.[0]?.confidence,
            analysis: aiAnalysis
          },
          quality_score: aiAnalysis.pronunciation_score,
          learning_category: aiAnalysis.learning_category,
          difficulty_level: aiAnalysis.difficulty_level,
          language_pair: 'goji-english'
        },
        {
          audio_recording_id: audioRecordingId,
          conversation_id: audioRecord.conversation_id,
          data_type: 'pronunciation',
          content: JSON.stringify({
            text: transcriptionResult.text,
            pronunciation_score: aiAnalysis.pronunciation_score,
            segments: transcriptionResult.segments
          }),
          metadata: {
            improvement_suggestions: aiAnalysis.improvement_suggestions,
            key_phrases: aiAnalysis.key_phrases
          },
          quality_score: aiAnalysis.pronunciation_score,
          learning_category: 'pronunciation',
          difficulty_level: aiAnalysis.difficulty_level,
          language_pair: 'goji-english'
        }
      ]);

    console.log(`Successfully processed audio recording ${audioRecordingId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcription: transcriptionResult.text,
        analysis: aiAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing audio:', error);
    
    // Update status to failed if we have the ID
    try {
      const { audioRecordingId } = await req.json();
      if (audioRecordingId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('audio_recordings')
          .update({ processing_status: 'failed' })
          .eq('id', audioRecordingId);
      }
    } catch (updateError) {
      console.error('Failed to update status to failed:', updateError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});