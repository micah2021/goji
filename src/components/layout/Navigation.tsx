import { useState } from "react";
import { Mic, Book, FileMusic, MessageCircle, User, GraduationCap, Hash, Info, Brain, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const tabs = [
    { id: "chat", icon: MessageCircle, label: "Chat", labelHa: "Hira" },
    { id: "learn", icon: Book, label: "Learn", labelHa: "Koyo" },
    { id: "tutor", icon: Brain, label: "AI Tutor", labelHa: "Malamin AI" },
    { id: "about", icon: Info, label: "About", labelHa: "Game da" },
    { id: "profile", icon: User, label: "Profile", labelHa: "Bayani" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully!" });
    } catch (error) {
      toast({ title: "Error signing out", variant: "destructive" });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map(({ id, icon: Icon, label, labelHa }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
              activeTab === id
                ? "text-primary bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium truncate">{label}</span>
            <span className="text-xs text-muted-foreground truncate">{labelHa}</span>
          </button>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 text-destructive hover:text-destructive hover:bg-accent/50"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium truncate">Sign Out</span>
          <span className="text-xs text-muted-foreground truncate">Fita</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;