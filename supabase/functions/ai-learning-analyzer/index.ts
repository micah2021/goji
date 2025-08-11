import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, analysisType = 'comprehensive' } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation data for analysis
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(
          id, text, created_at, user_id,
          profiles:user_id(username, full_name)
        ),
        ai_learning_data(*)
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversationData) {
      throw new Error('Conversation not found');
    }

    // Prepare conversation context for GPT analysis
    const messages = conversationData.messages || [];
    const conversationText = messages
      .map((msg: any) => `${msg.profiles?.username || 'User'}: ${msg.text}`)
      .join('\n');

    let analysisPrompt = '';
    let systemPrompt = '';

    switch (analysisType) {
      case 'vocabulary':
        systemPrompt = `You are an expert Goji language vocabulary analyzer. Extract and analyze vocabulary usage patterns from conversations.`;
        analysisPrompt = `Analyze this Goji language conversation for vocabulary learning insights:

${conversationText}

Return JSON with:
- new_vocabulary: array of unique Goji words/phrases with English translations
- difficulty_level: beginner/intermediate/advanced
- vocabulary_patterns: common word structures and patterns
- cultural_vocabulary: culturally significant terms
- learning_recommendations: specific vocabulary study suggestions
- frequency_analysis: most commonly used words/phrases`;
        break;

      case 'grammar':
        systemPrompt = `You are an expert Goji language grammar analyzer. Identify grammatical structures and patterns.`;
        analysisPrompt = `Analyze this Goji language conversation for grammar learning insights:

${conversationText}

Return JSON with:
- grammar_structures: identified grammatical patterns
- sentence_patterns: common sentence structures
- verb_usage: verb forms and tenses used
- syntax_analysis: word order and syntax patterns
- error_corrections: potential grammar improvements
- learning_focus: grammar topics to study based on conversation`;
        break;

      case 'conversation':
        systemPrompt = `You are an expert conversation flow analyzer for language learning.`;
        analysisPrompt = `Analyze this conversation for conversational learning insights:

${conversationText}

Return JSON with:
- conversation_flow: analysis of dialogue structure
- turn_taking_patterns: how participants engage
- topic_progression: how topics develop
- communication_strategies: effective communication techniques used
- cultural_communication: cultural aspects of communication
- improvement_suggestions: how to improve conversational skills`;
        break;

      default: // comprehensive
        systemPrompt = `You are an expert language learning AI analyzing Goji language conversations for comprehensive learning insights.`;
        analysisPrompt = `Perform a comprehensive analysis of this Goji language conversation:

${conversationText}

Return JSON with:
- overall_proficiency: estimated proficiency level
- vocabulary_insights: key vocabulary observations
- grammar_insights: grammatical pattern observations
- cultural_insights: cultural learning opportunities
- pronunciation_notes: likely pronunciation challenges
- learning_priorities: top 3 areas for improvement
- conversation_quality: assessment of natural flow
- ai_training_value: how valuable this data is for AI training (0-1)`;
    }

    // Call GPT for analysis
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`OpenAI API error: ${await analysisResponse.text()}`);
    }

    const analysisResult = await analysisResponse.json();
    const aiAnalysis = JSON.parse(analysisResult.choices[0].message.content);

    // Store the analysis as learning data
    const { data: learningData, error: learningError } = await supabase
      .from('ai_learning_data')
      .insert({
        conversation_id: conversationId,
        data_type: 'conversation_flow',
        content: JSON.stringify(aiAnalysis),
        metadata: {
          analysis_type: analysisType,
          message_count: messages.length,
          participant_count: new Set(messages.map((m: any) => m.user_id)).size,
          analysis_timestamp: new Date().toISOString()
        },
        quality_score: aiAnalysis.ai_training_value || 0.8,
        learning_category: analysisType === 'comprehensive' ? 'conversation' : analysisType,
        difficulty_level: aiAnalysis.overall_proficiency || aiAnalysis.difficulty_level || 'intermediate',
        language_pair: 'goji-english'
      })
      .select()
      .single();

    if (learningError) {
      console.error('Failed to store learning data:', learningError);
    }

    // Update conversation metadata with analysis insights
    await supabase
      .from('conversations')
      .update({
        metadata: {
          ...conversationData.metadata,
          last_analysis: new Date().toISOString(),
          analysis_insights: aiAnalysis,
          ai_training_value: aiAnalysis.ai_training_value
        }
      })
      .eq('id', conversationId);

    console.log(`Successfully analyzed conversation ${conversationId} with type ${analysisType}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: aiAnalysis,
        learningDataId: learningData?.id,
        conversationStats: {
          messageCount: messages.length,
          participantCount: new Set(messages.map((m: any) => m.user_id)).size
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing conversation:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});