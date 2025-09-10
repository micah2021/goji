import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Brain, CheckCircle } from "lucide-react";

export const FineTuningManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [trainingData, setTrainingData] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTrainingData = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-training-data');
      
      if (error) throw error;

      setTrainingData(data);
      
      // Create downloadable file
      const blob = new Blob([data], { type: 'application/jsonl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goji-training-data.jsonl';
      a.click();
      
      toast({
        title: "Training Data Generated",
        description: "Downloaded goji-training-data.jsonl file. Upload this to OpenAI for fine-tuning.",
      });
    } catch (error) {
      console.error('Error generating training data:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createFineTuningJob = async () => {
    if (!trainingData) {
      toast({
        title: "No Training Data",
        description: "Generate training data first",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingJob(true);
    try {
      const blob = new Blob([trainingData], { type: 'application/jsonl' });
      
      const { data, error } = await supabase.functions.invoke('create-fine-tuning-job', {
        body: { trainingFile: blob }
      });
      
      if (error) throw error;

      toast({
        title: "Fine-tuning Job Created",
        description: `Job ID: ${data.job_id}. Check OpenAI dashboard for progress.`,
      });
    } catch (error) {
      console.error('Error creating fine-tuning job:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingJob(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          LLM Fine-tuning Manager
        </h2>
        <p className="text-muted-foreground">
          Fine-tune an AI model on your Goji language database
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              OpenAI Fine-tuning (Recommended)
            </CardTitle>
            <CardDescription>
              Create custom GPT model trained on your Goji data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Steps:</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Generate training data from your database</li>
                <li>2. Create fine-tuning job on OpenAI</li>
                <li>3. Wait for training completion (~1-24 hours)</li>
                <li>4. Update AI tutor to use your custom model</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={generateTrainingData}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "1. Generate Training Data"}
              </Button>
              
              <Button 
                onClick={createFineTuningJob}
                disabled={isCreatingJob || !trainingData}
                variant="outline"
                className="w-full"
              >
                {isCreatingJob ? "Creating Job..." : "2. Create Fine-tuning Job"}
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Cost:</strong> ~$8-20 for training</p>
              <p><strong>Usage:</strong> ~$6/1M tokens (3x base model)</p>
              <p><strong>Best for:</strong> Production apps, high quality</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Alternative Approaches
            </CardTitle>
            <CardDescription>
              Other ways to customize the AI for your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">RAG (Current)</h4>
                <p className="text-sm text-muted-foreground">
                  Uses embeddings + semantic search. Already implemented in your app.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Few-shot Prompting</h4>
                <p className="text-sm text-muted-foreground">
                  Include examples in system prompt. Cheaper but less consistent.
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Open Source Models</h4>
                <p className="text-sm text-muted-foreground">
                  Use Llama/Mistral with LoRA fine-tuning. More complex setup.
                </p>
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">
              <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                Current Status
              </div>
              <p className="text-green-600 dark:text-green-400">
                Your app already uses RAG with embeddings for context-aware responses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">~1000</div>
              <div className="text-sm text-muted-foreground">Dictionary Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">~500</div>
              <div className="text-sm text-muted-foreground">Cultural Contexts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">~200</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">~3000</div>
              <div className="text-sm text-muted-foreground">Training Examples</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};