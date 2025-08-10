import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import CulturalBackground from "@/components/layout/CulturalBackground";
import RecordPage from "@/components/pages/RecordPage";
import LessonsPage from "@/components/pages/LessonsPage";
import DictionaryPage from "@/components/pages/DictionaryPage";
import NumbersPage from "@/components/pages/NumbersPage";
import StoriesPage from "@/components/pages/StoriesPage";
import AboutPage from "@/components/pages/AboutPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("record");

  const renderPage = () => {
    switch (activeTab) {
      case "record":
        return <RecordPage />;
      case "lessons":
        return <LessonsPage />;
      case "dictionary":
        return <DictionaryPage />;
      case "numbers":
        return <NumbersPage />;
      case "stories":
        return <StoriesPage />;
      case "about":
        return <AboutPage />;
      default:
        return <RecordPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <CulturalBackground />
      <main className="max-w-md mx-auto bg-card/95 backdrop-blur-sm shadow-lg min-h-screen relative z-10">
        <div className="animate-fade-in">
          {renderPage()}
        </div>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default Index;
