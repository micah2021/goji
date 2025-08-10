import { useState } from "react";
import { Mic, Book, FileMusic, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: "record", icon: Mic, label: "Record", labelHa: "Yin sauti" },
    { id: "dictionary", icon: Book, label: "Dictionary", labelHa: "Kamus" },
    { id: "stories", icon: FileMusic, label: "Stories", labelHa: "Labarai" },
    { id: "tutor", icon: MessageCircle, label: "Tutor", labelHa: "Malami" },
    { id: "profile", icon: User, label: "Profile", labelHa: "Bayani" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
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
      </div>
    </nav>
  );
};

export default Navigation;