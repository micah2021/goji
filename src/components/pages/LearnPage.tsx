import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LessonsPage from "./LessonsPage";
import DictionaryPage from "./DictionaryPage";
import PhonologyPage from "./PhonologyPage";
import StoriesPage from "./StoriesPage";
import VocabularyLearning from "../learner/VocabularyLearning";

const LearnPage = () => {
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Learn Goji</h1>
        <p className="text-sm text-muted-foreground">
          Lessons & Dictionary • Darussai da Kamus
        </p>
      </div>

      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-0.5">
          <TabsTrigger value="vocabulary" className="text-xs px-1">Vocab</TabsTrigger>
          <TabsTrigger value="lessons" className="text-xs px-1">Lessons</TabsTrigger>
          <TabsTrigger value="dictionary" className="text-xs px-1">Dictionary</TabsTrigger>
          <TabsTrigger value="phonology" className="text-xs px-1">Sounds</TabsTrigger>
          <TabsTrigger value="stories" className="text-xs px-1">Stories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vocabulary" className="mt-0">
          <VocabularyLearning />
        </TabsContent>
        
        <TabsContent value="lessons" className="mt-0">
          <LessonsPage />
        </TabsContent>
        
        <TabsContent value="dictionary" className="mt-0">
          <DictionaryPage />
        </TabsContent>
        
        <TabsContent value="phonology" className="mt-0">
          <PhonologyPage />
        </TabsContent>
        
        <TabsContent value="stories" className="mt-0">
          <StoriesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnPage;