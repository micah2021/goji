import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import RecordPage from "@/components/pages/RecordPage";
import LessonsPage from "@/components/pages/LessonsPage";
import DictionaryPage from "@/components/pages/DictionaryPage";
import NumbersPage from "@/components/pages/NumbersPage";
import StoriesPage from "@/components/pages/StoriesPage";
import AboutPage from "@/components/pages/AboutPage";
import TutorPage from "@/components/pages/TutorPage";
import ProfilePage from "@/components/pages/ProfilePage";

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
      case "tutor":
        return <TutorPage />;
      case "profile":
        return <ProfilePage />;
      case "about":
        return <AboutPage />;
      default:
        return <RecordPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Goji Landscape Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        style={{
          backgroundImage: "url('/lovable-uploads/c4c2a594-2bf4-425d-92a2-6f2e7a5c6a7f.png')"
        }}
      />
      <main className="w-full min-h-screen bg-card/80 relative z-10">
        <div className="animate-fade-in">
          {renderPage()}
        </div>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default Index;
