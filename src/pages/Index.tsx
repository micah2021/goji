import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import Navigation from "@/components/layout/Navigation";
import ChatPage from "@/components/pages/ChatPage";
import LearnPage from "@/components/pages/LearnPage";
import TutorPage from "@/components/pages/TutorPage";
import AboutPage from "@/components/pages/AboutPage";
import ProfilePage from "@/components/pages/ProfilePage";
import AuthPage from "@/components/auth/AuthPage";
import gojiLogo from "@/assets/goji-logo.png";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={gojiLogo} alt="Goji" className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "community":
        return <ChatPage />;
      case "learn":
        return <LearnPage />;
      case "tutor":
        return <TutorPage />;
      case "about":
        return <AboutPage />;
      case "analytics":
        return <ProfilePage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Goji Landscape Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-90 pointer-events-none"
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
