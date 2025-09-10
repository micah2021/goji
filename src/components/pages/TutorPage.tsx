import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AILanguageTutor } from "@/components/ai/AILanguageTutor";
import { AIContentGenerator } from "@/components/ai/AIContentGenerator";
import { FineTuningManager } from "@/components/ai/FineTuningManager";
import { Brain, Sparkles, Settings } from "lucide-react";

const TutorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Learning Center
          </h1>
          <p className="text-muted-foreground">
            Learn Goji with AI-powered tutoring and content generation
          </p>
        </div>

        <Tabs defaultValue="tutor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Content Generator
            </TabsTrigger>
            <TabsTrigger value="finetune" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Fine-tuning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="mt-6">
            <AILanguageTutor />
          </TabsContent>

          <TabsContent value="generator" className="mt-6">
            <AIContentGenerator />
          </TabsContent>

          <TabsContent value="finetune" className="mt-6">
            <FineTuningManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TutorPage;