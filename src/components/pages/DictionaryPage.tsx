import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - will be replaced with Supabase data
  const sampleWords = [
    {
      id: 1,
      goji: "Yako",
      english: "How are you?",
      hausa: "Yaya kake?",
      category: "greetings"
    },
    {
      id: 2,
      goji: "Lafia",
      english: "Health/Peace",
      hausa: "Lafiya",
      category: "greetings"
    },
  ];

  const filteredWords = sampleWords.filter(word =>
    word.goji.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.hausa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dictionary</h1>
          <Button size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words... / Bincika kalmomi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredWords.map((word) => (
          <Card key={word.id} className="p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{word.goji}</h3>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">English:</span> {word.english}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Hausa:</span> {word.hausa}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {word.category}
                </span>
                <Button variant="outline" size="sm">
                  Play Audio
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No words found</p>
          <p className="text-sm text-muted-foreground">Ba a sami kalmomi ba</p>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;