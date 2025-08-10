import { useState, useEffect } from "react";
import { Search, Plus, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DictionaryEntry {
  id: string;
  goji_text: string;
  english_translation: string | null;
  hausa_translation: string | null;
  category_id: string;
  audio_data: string | null;
  goji_categories: {
    name: string;
  } | null;
}

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      // Sample data for now - will be replaced when database is properly set up
      const sampleData: DictionaryEntry[] = [
        {
          id: "1",
          goji_text: "Yako",
          english_translation: "How are you?",
          hausa_translation: "Yaya kake?",
          category_id: "greetings",
          audio_data: null,
          goji_categories: { name: "greetings" }
        },
        {
          id: "2", 
          goji_text: "Lafia",
          english_translation: "Health/Peace",
          hausa_translation: "Lafiya",
          category_id: "greetings",
          audio_data: null,
          goji_categories: { name: "greetings" }
        },
        {
          id: "3",
          goji_text: "Sannu",
          english_translation: "Hello/Welcome",
          hausa_translation: "Sannu",
          category_id: "greetings", 
          audio_data: null,
          goji_categories: { name: "greetings" }
        }
      ];
      
      setEntries(sampleData);
    } catch (error) {
      toast({ title: "Error", description: "Could not load dictionary entries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioData: string | null) => {
    if (!audioData) {
      toast({ title: "No audio", description: "No audio available for this word" });
      return;
    }
    
    try {
      const audio = new Audio(audioData);
      audio.play();
    } catch (error) {
      toast({ title: "Error", description: "Could not play audio", variant: "destructive" });
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.goji_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.english_translation && entry.english_translation.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.hausa_translation && entry.hausa_translation.toLowerCase().includes(searchTerm.toLowerCase()))
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

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading dictionary...</p>
          <p className="text-sm text-muted-foreground">Ana loda kamus...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{entry.goji_text}</h3>
                <div className="space-y-1">
                  {entry.english_translation && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">English:</span> {entry.english_translation}
                    </p>
                  )}
                  {entry.hausa_translation && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Hausa:</span> {entry.hausa_translation}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {entry.goji_categories?.name || 'general'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(entry.audio_data)}
                    className="flex items-center space-x-1"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Play Audio</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No words found</p>
          <p className="text-sm text-muted-foreground">Ba a sami kalmomi ba</p>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;