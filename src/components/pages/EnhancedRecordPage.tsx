import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import { 
  Mic, 
  PlayCircle, 
  StopCircle, 
  TrendingUp, 
  Volume2, 
  BarChart3,
  Target,
  Star
} from "lucide-react";

interface AudioRecord {
  id: string;
  transcription: string;
  pronunciation_score: number;
  ai_analysis: any;
  created_at: string;
  processing_status: string;
  audio_url?: string;
}

interface PronunciationStats {
  average_score: number;
  improvement_trend: number;
  recent_sessions: number;
  best_score: number;
}

export const EnhancedRecordPage = () => {
  const [recordings, setRecordings] = useState<AudioRecord[]>([]);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [practiceWords] = useState([
    { goji: "niyo", english: "person", hausa: "mutum" },
    { goji: "wi", english: "goat", hausa: "akuya" },
    { goji: "mina", english: "house", hausa: "gida" },
    { goji: "ɓai", english: "dog", hausa: "kare" },
    { goji: "biro", english: "tree", hausa: "itace" }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    loadRecordings();
    loadPronunciationStats();
  }, []);

  const loadRecordings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audio_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecordings(data || []);
    } catch (error: any) {
      console.error('Error loading recordings:', error);
      toast({
        title: "Error",
        description: "Could not load your recordings",
        variant: "destructive"
      });
    }
  };

  const loadPronunciationStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate pronunciation statistics from recordings
      const { data, error } = await supabase
        .from('audio_recordings')
        .select('pronunciation_score, created_at')
        .eq('user_id', user.id)
        .not('pronunciation_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const scores = data.map(r => r.pronunciation_score).filter(s => s !== null);
        const recentScores = scores.slice(0, 5);
        const olderScores = scores.slice(5, 10);
        
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const avgOlder = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : avgRecent;
        
        setStats({
          average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
          improvement_trend: avgRecent - avgOlder,
          recent_sessions: data.length,
          best_score: Math.max(...scores)
        });
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = () => {
    loadRecordings();
    loadPronunciationStats();
    toast({
      title: "Recording saved!",
      description: "Your pronunciation is being analyzed. Check back in a moment for results."
    });
  };

  const playAudio = async (audioUrl: string) => {
    try {
      const { data } = await supabase.storage
        .from('chat-audio')
        .download(audioUrl.split('/').pop()!);
      
      if (data) {
        const url = URL.createObjectURL(data);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Could not play audio",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Loading your pronunciation data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Pronunciation Practice</h1>
        <p className="text-muted-foreground">
          Improve your Goji pronunciation with AI-powered feedback
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.average_score * 100).toFixed(0)}%
              </div>
              <Progress value={stats.average_score * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(stats.best_score * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">Personal best</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.improvement_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.improvement_trend >= 0 ? '+' : ''}
                {(stats.improvement_trend * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">Recent trend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.recent_sessions}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Practice sessions</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="practice" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-6">
          {/* Word Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Choose a Word to Practice
              </CardTitle>
              <CardDescription>
                Select a Goji word and practice your pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {practiceWords.map((word, index) => (
                  <Card 
                    key={index}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedWord === word.goji ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedWord(word.goji)}
                  >
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-primary">{word.goji}</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">English:</span> {word.english}</p>
                        <p><span className="font-medium">Hausa:</span> {word.hausa}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface */}
          {selectedWord && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Practice: "{selectedWord}"
                </CardTitle>
                <CardDescription>
                  Record yourself saying this word and get AI feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <h2 className="text-2xl font-bold mb-2">{selectedWord}</h2>
                  <p className="text-muted-foreground">
                    {practiceWords.find(w => w.goji === selectedWord)?.english} • {practiceWords.find(w => w.goji === selectedWord)?.hausa}
                  </p>
                </div>
                
                <VoiceRecorder 
                  conversationId="pronunciation-practice"
                  onAudioSent={handleRecordingComplete}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Recordings</CardTitle>
              <CardDescription>
                Your pronunciation practice history and AI feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recordings yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start practicing to see your progress here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <Card key={recording.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={recording.processing_status === 'completed' ? 'default' : 'secondary'}>
                              {recording.processing_status}
                            </Badge>
                            {recording.pronunciation_score && (
                              <Badge variant="outline">
                                Score: {(recording.pronunciation_score * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          
                          {recording.transcription && (
                            <div>
                              <p className="font-medium">Transcription:</p>
                              <p className="text-muted-foreground">{recording.transcription}</p>
                            </div>
                          )}
                          
                          {recording.ai_analysis && (
                            <div>
                              <p className="font-medium">AI Feedback:</p>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {recording.ai_analysis.improvement_suggestions?.map((suggestion: string, index: number) => (
                                  <p key={index}>• {suggestion}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {new Date(recording.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => recording.audio_url && playAudio(recording.audio_url)}
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};