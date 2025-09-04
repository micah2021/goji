import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Volume2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DictionaryEntry {
  id: string;
  goji_word: string;
  english_translation: string;
  hausa_translation?: string;
  part_of_speech?: string;
  difficulty_level: string;
  semantic_category?: string;
  pronunciation_guide?: string;
}

const VocabularyLearning = () => {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'animals', label: 'Animals' },
    { value: 'body_parts', label: 'Body Parts' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'household', label: 'Household' },
    { value: 'nature', label: 'Nature' },
    { value: 'actions', label: 'Actions' },
    { value: 'general', label: 'General' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    fetchVocabulary();
  }, [selectedCategory, selectedDifficulty]);

  const fetchVocabulary = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('dictionary_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Apply difficulty filter if not 'all'
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply category filter if not 'all'
      if (selectedCategory !== 'all') {
        query = query.eq('semantic_category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log('Fetched vocabulary entries:', data?.length);
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      toast.error('Failed to load vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; // Approximate for Goji
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Vocabulary Learning</h2>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Learn Goji words from the academic dictionary
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
          <div className="flex gap-1">
            {difficulties.map((diff) => (
              <Button
                key={diff.value}
                variant={selectedDifficulty === diff.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(diff.value)}
              >
                {diff.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Vocabulary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold text-primary">
                    {entry.goji_word}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(entry.goji_word)}
                    className="shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="text-base font-medium">
                  {entry.english_translation}
                </CardDescription>
                {entry.hausa_translation && (
                  <p className="text-sm text-muted-foreground">
                    Hausa: {entry.hausa_translation}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={getDifficultyColor(entry.difficulty_level)}
                  >
                    {entry.difficulty_level}
                  </Badge>
                  {entry.part_of_speech && (
                    <Badge variant="outline" className="text-xs">
                      {entry.part_of_speech}
                    </Badge>
                  )}
                  {entry.semantic_category && entry.semantic_category !== 'general' && (
                    <Badge variant="secondary" className="text-xs">
                      {entry.semantic_category.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {entry.pronunciation_guide && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {entry.pronunciation_guide}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No vocabulary found for the selected filters.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try importing the Kushi dictionary first or select different filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VocabularyLearning;