import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";

const StoriesPage = () => {
  // Sample data - will be replaced with Supabase data
  const sampleStories = [
    {
      id: 1,
      title: "The Origin of Goji People",
      titleHa: "Asalin Mutanen Goji",
      category: "folktale",
      duration: "5:30"
    },
    {
      id: 2,
      title: "Traditional Goji Wedding Song",
      titleHa: "Waƙar Bikin Goji na Gargajiya",
      category: "song",
      duration: "3:45"
    },
  ];

  const categories = [
    { id: "all", label: "All", labelHa: "Duka" },
    { id: "folktale", label: "Folktales", labelHa: "Tatsuniyoyi" },
    { id: "song", label: "Songs", labelHa: "Waƙoƙi" },
    { id: "history", label: "History", labelHa: "Tarihi" },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Cultural Archive</h1>
        <p className="text-sm text-muted-foreground">
          Stories, songs, and traditions • Labarai, waƙoƙi, da al'adun gargajiya
        </p>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <span>{category.label}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {category.labelHa}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sampleStories.map((story) => (
          <Card key={story.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {story.titleHa}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {story.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {story.duration}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full flex items-center justify-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Listen • Saurara</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoriesPage;