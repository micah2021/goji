import { useState, useEffect } from "react";
import { Search, Plus, Volume2, Users, Home, TreePine, Apple } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DictionaryEntry {
  id: string;
  goji_text: string;
  english_translation: string | null;
  hausa_translation: string | null;
  category_id: string;
  audio_data: string | null;
  example_sentence?: string;
  goji_categories: {
    name: string;
    emoji: string;
  } | null;
}

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "All", emoji: "🔍", nameHa: "Duka" },
    { id: "people", name: "People & Family", emoji: "👨‍🌾", nameHa: "Mutane da Iyali" },
    { id: "animals", name: "Animals", emoji: "🐐", nameHa: "Dabbobi" },
    { id: "home", name: "Home & Objects", emoji: "🏠", nameHa: "Gida da Kayayyaki" },
    { id: "nature", name: "Nature", emoji: "🌳", nameHa: "Yanayi" },
    { id: "food", name: "Food", emoji: "🍲", nameHa: "Abinci" },
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      // Preloaded words from the 2006 document
      const gojiWords: DictionaryEntry[] = [
        // People & Family
        { id: "1", goji_text: "niyo", english_translation: "person", hausa_translation: "uwa", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "2", goji_text: "shuji", english_translation: "Husband", hausa_translation: "uba", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "3", goji_text: "lano", english_translation: "child", hausa_translation: "yaro", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "4", goji_text: "memme", english_translation: "people", hausa_translation: "mutane", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "5", goji_text: "poomun", english_translation: "wife", hausa_translation: "mata", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        
        // Animals
        { id: "6", goji_text: "wi", english_translation: "goat", hausa_translation: "akuya", category_id: "animals", audio_data: null, example_sentence: "wi ɗo̱ƙ = one goat", goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "7", goji_text: "fe", english_translation: "hen/chicken", hausa_translation: "kaza", category_id: "animals", audio_data: null, example_sentence: "fe gbe = many hens", goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "8", goji_text: "ɓai", english_translation: "dog", hausa_translation: "kare", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "9", goji_text: "jango̱ni", english_translation: "cat", hausa_translation: "kyanwa", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "10", goji_text: "gbe", english_translation: "many", hausa_translation: "da yawa", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        
        // Home & Objects
        { id: "11", goji_text: "mina", english_translation: "house", hausa_translation: "gida", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "12", goji_text: "pomina", english_translation: "room", hausa_translation: "daki", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "13", goji_text: "telan", english_translation: "pot", hausa_translation: "tukunya", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "14", goji_text: "gburam", english_translation: "chair", hausa_translation: "kujera", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "15", goji_text: "bo dan", english_translation: "door", hausa_translation: "kofa", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        
        // Nature
        { id: "16", goji_text: "biro wiri", english_translation: "tree", hausa_translation: "itace", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "17", goji_text: "ɗou", english_translation: "water", hausa_translation: "ruwa", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "18", goji_text: "shela", english_translation: "stone", hausa_translation: "dutse", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "19", goji_text: "daran", english_translation: "sun", hausa_translation: "rana", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "20", goji_text: "Tere", english_translation: "moon", hausa_translation: "wata", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        
        // Food
        { id: "21", goji_text: "Wecina", english_translation: "food", hausa_translation: "abinci", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "22", goji_text: "olo̱", english_translation: "meat", hausa_translation: "nama", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "23", goji_text: "shanye", english_translation: "yam", hausa_translation: "doya", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "24", goji_text: "komo", english_translation: "corn", hausa_translation: "masara", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        
        // Additional words
        { id: "25", goji_text: "ɗo̱ƙ", english_translation: "one", hausa_translation: "ɗaya", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "26", goji_text: "palou", english_translation: "two", hausa_translation: "biyu", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "27", goji_text: "tat", english_translation: "three", hausa_translation: "uku", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "28", goji_text: "kpomo", english_translation: "ten", hausa_translation: "goma", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "29", goji_text: "fuwat", english_translation: "five", hausa_translation: "biyar", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "30", goji_text: "parabanam", english_translation: "six", hausa_translation: "shida", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
      ];
      
      setEntries(gojiWords);
    } catch (error) {
      toast({ title: "Error", description: "Could not load dictionary entries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioData: string | null, word: string) => {
    if (!audioData) {
      toast({ title: "No audio", description: `Audio for "${word}" will be available soon` });
      return;
    }
    
    try {
      const audio = new Audio(audioData);
      audio.play();
    } catch (error) {
      toast({ title: "Error", description: "Could not play audio", variant: "destructive" });
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.goji_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.english_translation && entry.english_translation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.hausa_translation && entry.hausa_translation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || entry.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kamus Goji</h1>
            <p className="text-sm text-muted-foreground">Goji Dictionary</p>
          </div>
          <Button size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Find a word... / Nemo kalma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-1 whitespace-nowrap"
            >
              <span>{category.emoji}</span>
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.nameHa}</span>
            </Button>
          ))}
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
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-goji-earth mb-1">{entry.goji_text}</h3>
                    <div className="space-y-1">
                      {entry.english_translation && (
                        <p className="text-sm text-foreground">
                          <span className="font-medium text-goji-warm">English:</span> {entry.english_translation}
                        </p>
                      )}
                      {entry.hausa_translation && (
                        <p className="text-sm text-foreground">
                          <span className="font-medium text-goji-warm">Hausa:</span> {entry.hausa_translation}
                        </p>
                      )}
                      {entry.example_sentence && (
                        <p className="text-xs text-muted-foreground italic">
                          Example: {entry.example_sentence}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(entry.audio_data, entry.goji_text)}
                    className="flex items-center space-x-1 border-goji-warm text-goji-warm hover:bg-goji-warm hover:text-white"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Play</span>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary" className="bg-goji-accent/20 text-goji-earth">
                    {entry.goji_categories?.emoji} {entry.goji_categories?.name || 'general'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    From 2006 Goji Document
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <p className="text-muted-foreground">No words found</p>
          <p className="text-sm text-muted-foreground">Ba a sami kalmomi ba</p>
          <Button variant="outline" onClick={() => {setSearchTerm(""); setSelectedCategory("all")}}>
            Show All Words
          </Button>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;