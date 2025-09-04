import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GenerateEmbeddingsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting embedding generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-embeddings');
      
      console.log('Embedding generation response:', { data, error });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Embeddings Generated Successfully",
        description: `Processed ${data.processed} out of ${data.total} dictionary entries`,
      });
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

  return (
    <Button 
      onClick={handleGenerateEmbeddings} 
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? "Generating..." : "Generate Embeddings"}
    </Button>
  );
};