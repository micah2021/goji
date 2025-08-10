import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export const AIContentGenerator = () => {
  const [contentType, setContentType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!contentType || !prompt) {
      toast({
        title: "Missing information",
        description: "Please select content type and enter a prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-goji-content', {
        body: { type: contentType, prompt, theme }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast({
        title: "Content generated!",
        description: "AI has created new Goji content for review.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsContribution = async () => {
    if (!generatedContent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save contributions.",
          variant: "destructive",
        });
        return;
      }

      let contributionData;
      if (contentType === 'word' || contentType === 'phrase') {
        contributionData = {
          type: contentType,
          goji_text: generatedContent.goji_word,
          english_translation: generatedContent.english_translation,
          hausa_translation: generatedContent.hausa_translation,
          example_sentence: generatedContent.example_sentence,
          cultural_context: generatedContent.cultural_context,
          user_id: user.id,
        };
      } else if (contentType === 'story') {
        contributionData = {
          type: contentType,
          goji_text: generatedContent.goji_text,
          english_translation: generatedContent.english_translation,
          hausa_translation: generatedContent.hausa_translation,
          cultural_context: generatedContent.cultural_context,
          user_id: user.id,
        };
      }

      const { error } = await supabase
        .from("contributions")
        .insert([contributionData]);

      if (error) throw error;

      toast({
        title: "Saved as contribution!",
        description: "AI-generated content is now pending community review.",
      });

      setGeneratedContent(null);
      setPrompt("");
      setTheme("");
    } catch (error) {
      toast({
        title: "Error saving contribution",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Use AI to generate authentic Goji language content for the community to review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="lesson">Lesson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="theme">Theme (optional)</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., family, food, nature, traditions"
            />
          </div>

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Review and save as a community contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentType === 'word' && (
              <div className="space-y-2">
                <div><strong>Goji Word:</strong> {generatedContent.goji_word}</div>
                <div><strong>English:</strong> {generatedContent.english_translation}</div>
                <div><strong>Hausa:</strong> {generatedContent.hausa_translation}</div>
                <div><strong>Example:</strong> {generatedContent.example_sentence}</div>
                <div><strong>Cultural Context:</strong> {generatedContent.cultural_context}</div>
              </div>
            )}
            
            {contentType === 'story' && (
              <div className="space-y-2">
                <div><strong>Title:</strong> {generatedContent.title}</div>
                <div><strong>Goji Text:</strong> {generatedContent.goji_text}</div>
                <div><strong>English:</strong> {generatedContent.english_translation}</div>
                <div><strong>Hausa:</strong> {generatedContent.hausa_translation}</div>
                <div><strong>Cultural Context:</strong> {generatedContent.cultural_context}</div>
              </div>
            )}

            {contentType === 'lesson' && (
              <div className="space-y-2">
                <div><strong>Lesson:</strong> {generatedContent.lesson_title}</div>
                <div><strong>Grammar Point:</strong> {generatedContent.grammar_point}</div>
                <div><strong>Vocabulary:</strong> {JSON.stringify(generatedContent.vocabulary)}</div>
                <div><strong>Practice:</strong> {generatedContent.practice_sentences}</div>
                <div><strong>Cultural Notes:</strong> {generatedContent.cultural_notes}</div>
              </div>
            )}

            <Button onClick={handleSaveAsContribution} className="w-full">
              Save as Community Contribution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};