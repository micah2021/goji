import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LessonsPage from "./LessonsPage";
import DictionaryPage from "./DictionaryPage";
import PhonologyPage from "./PhonologyPage";

const LearnPage = () => {
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Learn Goji</h1>
        <p className="text-sm text-muted-foreground">
          Lessons & Dictionary • Darussai da Kamus
        </p>
      </div>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">Lessons • Darussai</TabsTrigger>
          <TabsTrigger value="dictionary">Dictionary • Kamus</TabsTrigger>
          <TabsTrigger value="phonology">Sounds • Eleparo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lessons" className="mt-0">
          <LessonsPage />
        </TabsContent>
        
        <TabsContent value="dictionary" className="mt-0">
          <DictionaryPage />
        </TabsContent>
        
        <TabsContent value="phonology" className="mt-0">
          <PhonologyPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnPage;