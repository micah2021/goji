import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ContributionForm = () => {
  const [formData, setFormData] = useState({
    type: "",
    goji_text: "",
    english_translation: "",
    hausa_translation: "",
    example_sentence: "",
    cultural_context: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.goji_text || !formData.english_translation) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to contribute.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("contributions")
        .insert([{ ...formData, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Contribution submitted!",
        description: "Your contribution is now pending community review.",
      });

      setFormData({
        type: "",
        goji_text: "",
        english_translation: "",
        hausa_translation: "",
        example_sentence: "",
        cultural_context: "",
      });
    } catch (error) {
      toast({
        title: "Error submitting contribution",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contribute to Goji Language</CardTitle>
        <CardDescription>
          Help preserve the Goji language by adding words, phrases, or stories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Contribution Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="phrase">Phrase</SelectItem>
                <SelectItem value="story">Story</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goji_text">Goji Text *</Label>
            <Input
              id="goji_text"
              value={formData.goji_text}
              onChange={(e) => setFormData({ ...formData, goji_text: e.target.value })}
              placeholder="Enter text in Goji language"
              required
            />
          </div>

          <div>
            <Label htmlFor="english_translation">English Translation *</Label>
            <Input
              id="english_translation"
              value={formData.english_translation}
              onChange={(e) => setFormData({ ...formData, english_translation: e.target.value })}
              placeholder="English translation"
              required
            />
          </div>

          <div>
            <Label htmlFor="hausa_translation">Hausa Translation</Label>
            <Input
              id="hausa_translation"
              value={formData.hausa_translation}
              onChange={(e) => setFormData({ ...formData, hausa_translation: e.target.value })}
              placeholder="Hausa translation (optional)"
            />
          </div>

          <div>
            <Label htmlFor="example_sentence">Example Sentence</Label>
            <Textarea
              id="example_sentence"
              value={formData.example_sentence}
              onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
              placeholder="Example sentence using this word/phrase"
            />
          </div>

          <div>
            <Label htmlFor="cultural_context">Cultural Context</Label>
            <Textarea
              id="cultural_context"
              value={formData.cultural_context}
              onChange={(e) => setFormData({ ...formData, cultural_context: e.target.value })}
              placeholder="Cultural significance or context"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Contribution"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};