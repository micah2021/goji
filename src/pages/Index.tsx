import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
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
    <div className="min-h-screen bg-background">
      <main className="max-w-md mx-auto bg-card shadow-lg min-h-screen relative">
        {renderPage()}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default Index;
