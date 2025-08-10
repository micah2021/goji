import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import RecordPage from "@/components/pages/RecordPage";
import DictionaryPage from "@/components/pages/DictionaryPage";
import StoriesPage from "@/components/pages/StoriesPage";
import TutorPage from "@/components/pages/TutorPage";
import ProfilePage from "@/components/pages/ProfilePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("record");

  const renderPage = () => {
    switch (activeTab) {
      case "record":
        return <RecordPage />;
      case "dictionary":
        return <DictionaryPage />;
      case "stories":
        return <StoriesPage />;
      case "tutor":
        return <TutorPage />;
      case "profile":
        return <ProfilePage />;
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
