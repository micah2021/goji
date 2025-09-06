import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Play, Pause, Search, Filter, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioUploadDialog from "../audio/AudioUploadDialog";
import { toast } from "sonner";

interface CulturalStory {
  id: string;
  title: string;
  description: string;
  context_type: string;
  cultural_significance: string;
  geographical_region: string;
  difficulty_level: string;
  created_at: string;
  user_id?: string;
  audio_url?: string;
  duration?: string;
  audio_recording_id?: string;
}

const StoriesPage = () => {
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const { user } = useAuth();

  const categories = [
    { id: "all", label: "All", labelHa: "Duka" },
    { id: "folktale", label: "Folktales", labelHa: "Tatsuniyoyi" },
    { id: "song", label: "Songs", labelHa: "Waƙoƙi" },
    { id: "history", label: "History", labelHa: "Tarihi" },
    { id: "tradition", label: "Traditions", labelHa: "Al'adoci" },
    { id: "ceremony", label: "Ceremonies", labelHa: "Bikuna" },
    { id: "wisdom", label: "Wisdom", labelHa: "Hikima" },
  ];

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Fetch cultural contexts with potential audio recordings
      let query = supabase
        .from('cultural_contexts')
        .select(`
          id,
          title,
          description,
          context_type,
          cultural_significance,
          geographical_region,
          difficulty_level,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('context_type', activeCategory);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,cultural_significance.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // For each story, try to find associated audio recordings
      const storiesWithAudio = await Promise.all(
        (data || []).map(async (story) => {
          const { data: audioData } = await supabase
            .from('audio_recordings')
            .select('id, file_url, duration_seconds')
            .ilike('transcription', `%${story.title}%`)
            .limit(1)
            .single();

          return {
            ...story,
            audio_url: audioData?.file_url,
            audio_recording_id: audioData?.id,
            duration: audioData?.duration_seconds 
              ? `${Math.floor(audioData.duration_seconds / 60)}:${String(Math.floor(audioData.duration_seconds % 60)).padStart(2, '0')}`
              : undefined
          };
        })
      );

      setStories(storiesWithAudio);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [activeCategory, searchTerm]);

  const handlePlayAudio = (storyId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (playingAudio && audioElements[playingAudio]) {
      audioElements[playingAudio].pause();
      audioElements[playingAudio].currentTime = 0;
    }

    if (playingAudio === storyId) {
      setPlayingAudio(null);
      return;
    }

    // Create or get audio element
    let audio = audioElements[storyId];
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        toast.error("Failed to load audio");
        setPlayingAudio(null);
      };
      setAudioElements(prev => ({ ...prev, [storyId]: audio }));
    }

    audio.play()
      .then(() => setPlayingAudio(storyId))
      .catch(() => {
        toast.error("Failed to play audio");
        setPlayingAudio(null);
      });
  };

  const handleStopAudio = (storyId: string) => {
    if (audioElements[storyId]) {
      audioElements[storyId].pause();
      audioElements[storyId].currentTime = 0;
    }
    setPlayingAudio(null);
  };

  const handleDeleteRecording = async (story: CulturalStory) => {
    if (!user || story.user_id !== user.id) return;
    
    if (!confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete the audio file from storage if it exists
      if (story.audio_url) {
        const fileName = story.audio_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('chat-audio')
            .remove([`elder-recordings/${fileName}`]);
        }
      }

      // Delete the audio recording entry if it exists
      if (story.audio_recording_id) {
        await supabase
          .from('audio_recordings')
          .delete()
          .eq('id', story.audio_recording_id);
      }

      // Delete the cultural context entry
      const { error } = await supabase
        .from('cultural_contexts')
        .delete()
        .eq('id', story.id);

      if (error) throw error;

      toast.success("Recording deleted successfully");
      fetchStories(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete recording");
    }
  };

  const formatContextType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      folktale: "Folktale • Tatsuniya",
      song: "Song • Waƙa", 
      history: "History • Tarihi",
      tradition: "Tradition • Al'ada",
      ceremony: "Ceremony • Biki",
      wisdom: "Wisdom • Hikima"
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading elder recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cultural Archive</h1>
            <p className="text-sm text-muted-foreground">
              Elder recordings & cultural heritage • Rikodin dattawa da al'adun gargajiya
            </p>
          </div>
          {user && <AudioUploadDialog onUploadComplete={fetchStories} />}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stories, traditions, and recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0"
              onClick={() => setActiveCategory(category.id)}
            >
              <span>{category.label}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {category.labelHa}
              </span>
            </Button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {stories.length} recording{stories.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {stories.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recordings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || activeCategory !== 'all' 
                ? "Try adjusting your search or filter criteria"
                : "Upload the first elder recording to get started"
              }
            </p>
            {user && <AudioUploadDialog onUploadComplete={fetchStories} />}
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      {story.title}
                    </h3>
                    {story.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {story.description}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {formatContextType(story.context_type)}
                      </span>
                      {story.geographical_region && (
                        <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded">
                          {story.geographical_region}
                        </span>
                      )}
                      {story.duration && (
                        <span className="text-xs text-muted-foreground">
                          {story.duration}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {story.difficulty_level}
                      </span>
                    </div>
                    {story.cultural_significance && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {story.cultural_significance}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {story.audio_url ? (
                    <Button 
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() => playingAudio === story.id 
                        ? handleStopAudio(story.id)
                        : handlePlayAudio(story.id, story.audio_url!)
                      }
                    >
                      {playingAudio === story.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>
                        {playingAudio === story.id ? "Stop • Tsayar" : "Listen • Saurara"}
                      </span>
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Audio recording not yet available for this story
                      </p>
                    </div>
                  )}
                  
                  {/* Delete button for owner */}
                  {user && story.user_id === user.id && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() => handleDeleteRecording(story)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Recording</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StoriesPage;