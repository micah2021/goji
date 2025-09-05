import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EmbeddingTest = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const generateEmbeddings = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting embedding generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-embeddings');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Embeddings Generated Successfully",
        description: `Processed ${data.processed} out of ${data.total} dictionary entries`,
      });
      
      console.log('Embedding generation response:', data);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      toast({
        title: "Error generating embeddings",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testAITutor = async () => {
    setIsTesting(true);
    try {
      console.log('Testing AI tutor with Goji word...');
      
      const { data, error } = await supabase.functions.invoke('enhanced-ai-tutor', {
        body: {
          userInput: "What does 'khèwnè' mean in Goji?",
          conversationHistory: [],
          userId: null,
          lessonContext: { mode: 'vocabulary' }
        }
      });
      
      if (error) {
        throw error;
      }
      
      setTestResult(data);
      toast({
        title: "AI Tutor Test Complete",
        description: "Check the results below",
      });
      
      console.log('AI Tutor response:', data);
    } catch (error) {
      console.error('Error testing AI tutor:', error);
      toast({
        title: "Error testing AI tutor",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const checkEmbeddingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('dictionary_entries')
        .select('goji_word, embedding')
        .not('embedding', 'is', null)
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Embedding Status",
        description: `Found ${data.length} entries with embeddings`,
      });
      
      console.log('Sample entries with embeddings:', data);
    } catch (error) {
      console.error('Error checking embeddings:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Embedding Generation & AI Tutor Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={generateEmbeddings} 
            disabled={isGenerating}
            variant="default"
          >
            {isGenerating ? "Generating..." : "Generate Embeddings"}
          </Button>
          
          <Button 
            onClick={checkEmbeddingStatus}
            variant="outline"
          >
            Check Status
          </Button>
          
          <Button 
            onClick={testAITutor} 
            disabled={isTesting}
            variant="secondary"
          >
            {isTesting ? "Testing..." : "Test AI Tutor"}
          </Button>
        </div>
        
        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">AI Tutor Response:</h3>
            <p className="text-sm mb-2">{testResult.response}</p>
            <div className="text-xs text-muted-foreground">
              <p>Dictionary matches: {testResult.contextStats?.dictionaryMatches || 0}</p>
              <p>Cultural matches: {testResult.contextStats?.culturalMatches || 0}</p>
              <p>Learning matches: {testResult.contextStats?.learningMatches || 0}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};