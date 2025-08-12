import { useState, useEffect } from "react";
import { Search, Plus, Volume2, Users, Home, TreePine, Apple, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        { id: "1", goji_text: "niyo", english_translation: "mother", hausa_translation: "uwa", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "2", goji_text: "shuji", english_translation: "father", hausa_translation: "uba", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "3", goji_text: "poomun", english_translation: "child", hausa_translation: "yaro", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "4", goji_text: "memme", english_translation: "elder", hausa_translation: "dattijo", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        { id: "5", goji_text: "laano", english_translation: "wife", hausa_translation: "mata", category_id: "people", audio_data: null, goji_categories: { name: "people", emoji: "👨‍🌾" } },
        
        // Animals
        { id: "6", goji_text: "wi", english_translation: "goat", hausa_translation: "akuya", category_id: "animals", audio_data: null, example_sentence: "wi ɗo̱ƙ = one goat", goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "7", goji_text: "fe", english_translation: "hen/chicken", hausa_translation: "kaza", category_id: "animals", audio_data: null, example_sentence: "fe gbe = many hens", goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "8", goji_text: "ɓai", english_translation: "dog", hausa_translation: "kare", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "9", goji_text: "jango̱ni", english_translation: "cat", hausa_translation: "kyanwa", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        { id: "10", goji_text: "gbe", english_translation: "many", hausa_translation: "da yawa", category_id: "animals", audio_data: null, goji_categories: { name: "animals", emoji: "🐐" } },
        
        // Home & Objects
        { id: "11", goji_text: "minna", english_translation: "house", hausa_translation: "gida", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "12", goji_text: "pomina", english_translation: "room", hausa_translation: "daki", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "13", goji_text: "telan", english_translation: "pot", hausa_translation: "tukunya", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "14", goji_text: "gburam", english_translation: "chair", hausa_translation: "kujera", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        { id: "15", goji_text: "dummo̱", english_translation: "door", hausa_translation: "kofa", category_id: "home", audio_data: null, goji_categories: { name: "home", emoji: "🏠" } },
        
        // Nature
        { id: "16", goji_text: "biro", english_translation: "tree", hausa_translation: "itace", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "17", goji_text: "ɗo", english_translation: "water", hausa_translation: "ruwa", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "18", goji_text: "shela", english_translation: "stone", hausa_translation: "dutse", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "19", goji_text: "daran", english_translation: "sun", hausa_translation: "rana", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        { id: "20", goji_text: "tere", english_translation: "moon", hausa_translation: "wata", category_id: "nature", audio_data: null, goji_categories: { name: "nature", emoji: "🌳" } },
        
        // Food
        { id: "21", goji_text: "wechina", english_translation: "food", hausa_translation: "abinci", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "22", goji_text: "o̱lo̱", english_translation: "meat", hausa_translation: "nama", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "23", goji_text: "chanye", english_translation: "yam", hausa_translation: "doya", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        { id: "24", goji_text: "komo", english_translation: "corn", hausa_translation: "masara", category_id: "food", audio_data: null, goji_categories: { name: "food", emoji: "🍲" } },
        
        // Additional words
        { id: "25", goji_text: "ɗo̱ƙ", english_translation: "one", hausa_translation: "ɗaya", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "26", goji_text: "palou", english_translation: "two", hausa_translation: "biyu", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "27", goji_text: "tat", english_translation: "three", hausa_translation: "uku", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "28", goji_text: "kpomu", english_translation: "ten", hausa_translation: "goma", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "29", goji_text: "fuwat", english_translation: "five", hausa_translation: "biyar", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
        { id: "30", goji_text: "parabanan", english_translation: "six", hausa_translation: "shida", category_id: "numbers", audio_data: null, goji_categories: { name: "numbers", emoji: "🔢" } },
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kamus Goji</h1>
            <p className="text-sm text-muted-foreground">Goji Dictionary & Grammar</p>
          </div>
          <Button size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </Button>
        </div>

        <Tabs defaultValue="dictionary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dictionary">Dictionary • Kamus</TabsTrigger>
            <TabsTrigger value="grammar">Grammar • Nahawu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dictionary" className="mt-6 space-y-4">
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
          </TabsContent>

          <TabsContent value="grammar" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-goji-warm" />
                  <h2 className="text-xl font-bold text-foreground">Noun Pluralization Rules</h2>
                  <span className="text-sm text-muted-foreground">• Ka'idojin jam'i</span>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Rule */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-goji-earth">1. Basic Pluralization</h3>
                    <p className="text-sm text-muted-foreground">
                      Most nouns use a number (ɗo̱ƙ, palou...) or "gbe" (many) after the noun.
                    </p>
                    <div className="grid gap-3">
                      <Card className="p-3 bg-goji-accent/10">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-goji-earth">ɓai</span>
                            <span className="text-sm text-muted-foreground">dog • kare</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>ɓai ɗo̱ƙ</strong> = one dog • kare ɗaya</div>
                            <div><strong>ɓai gbe</strong> = many dogs • karnuka</div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-goji-accent/10">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-goji-earth">fe</span>
                            <span className="text-sm text-muted-foreground">hen • kaza</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>fe ɗo̱ƙ</strong> = one hen • kaza ɗaya</div>
                            <div><strong>fe gbe</strong> = hens • kazuna</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Special Rules */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-goji-earth">2. Special Ending Rules</h3>
                    
                    {/* Words ending in 'm' */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-goji-warm">Words ending in "m" → add "i"</h4>
                      <Card className="p-3 bg-blue-50 dark:bg-blue-950/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">gburam</span>
                            <span className="text-sm text-muted-foreground">wooden bed</span>
                          </div>
                          <div className="text-sm">
                            <div><strong>gburami ɗo̱ƙ</strong> = one wooden bed</div>
                            <div><strong>gburami gbe</strong> = many wooden beds</div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-blue-50 dark:bg-blue-950/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">shirim</span>
                            <span className="text-sm text-muted-foreground">fish • kifi</span>
                          </div>
                          <div className="text-sm">
                            <div><strong>shirimi ɗo̱ƙ</strong> = one fish</div>
                            <div><strong>shirimi gbe</strong> = many fish</div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Words ending in 'o' */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-goji-warm">Words ending in "o" → add "wi"</h4>
                      <Card className="p-3 bg-green-50 dark:bg-green-950/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">iro</span>
                            <span className="text-sm text-muted-foreground">woven mat • tabarma</span>
                          </div>
                          <div className="text-sm">
                            <div><strong>irowi ɗo̱ƙ</strong> = one woven mat</div>
                            <div><strong>irowi gbe</strong> = many woven mats</div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Words ending in 'ƙ' */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-goji-warm">Words ending in "ƙ" → change to "g" + add "i"</h4>
                      <Card className="p-3 bg-orange-50 dark:bg-orange-950/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">ɓuƙ</span>
                            <span className="text-sm text-muted-foreground">field • fili</span>
                          </div>
                          <div className="text-sm">
                            <div><strong>ɓugi ɗo̱ƙ</strong> = one field</div>
                            <div><strong>ɓugi gbe</strong> = many fields</div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Words ending in 'a' */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-goji-warm">Words ending in "a" → add "i" (creates "ai")</h4>
                      <Card className="p-3 bg-purple-50 dark:bg-purple-950/20">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">tanga</span>
                            <span className="text-sm text-muted-foreground">cow • shanu</span>
                          </div>
                          <div className="text-sm">
                            <div><strong>tangai ɗo̱ƙ</strong> = one cow</div>
                            <div><strong>tangai gbe</strong> = many cows</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Young forms */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-goji-earth">3. Young Forms</h3>
                    <p className="text-sm text-muted-foreground">
                      Use "la" for singular young, "shibo" for plural young forms.
                    </p>
                    <div className="grid gap-3">
                      <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div><strong>la ɓai</strong> = young dog • kare</div>
                            <div><strong>shibo ɓai</strong> = many young dogs • karnuka</div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div><strong>la shuji</strong> = young boy • namiji</div>
                            <div><strong>shibo shuji</strong> = many young boys • yamaza</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Irregular forms */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-goji-earth">4. Irregular Forms</h3>
                    <p className="text-sm text-muted-foreground">
                      Some nouns have special plural forms that don't follow the regular patterns.
                    </p>
                    <div className="grid gap-3">
                      <Card className="p-3 bg-red-50 dark:bg-red-950/20">
                        <div className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div><strong>shuji</strong> = man • namiji</div>
                            <div><strong>shuji gbe</strong> = many men • mazaje</div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-red-50 dark:bg-red-950/20">
                        <div className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div><strong>niyo</strong> = person • mutum</div>
                            <div><strong>memme</strong> = people • mutane</div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-red-50 dark:bg-red-950/20">
                        <div className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div><strong>poomun</strong> = woman • mace</div>
                            <div><strong>sherep</strong> = many women • mataye</div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DictionaryPage;