import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  BookOpen, 
  Clock,
  Trophy,
  Star,
  BarChart3
} from "lucide-react";

interface LearnerStats {
  vocabulary_mastered: number;
  vocabulary_learning: number;
  vocabulary_familiar: number;
  average_pronunciation_score: number;
  total_study_time_minutes: number;
  streak_days: number;
  preferred_topics: string[];
  improvement_areas: string[];
}

interface WordRecommendation {
  id: string;
  goji_word: string;
  english_translation: string;
  hausa_translation: string;
  difficulty_level: string;
  recommendation_reason: string;
  priority_score: number;
}

export const LearnerDashboard = () => {
  const [stats, setStats] = useState<LearnerStats | null>(null);
  const [recommendations, setRecommendations] = useState<WordRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLearnerData();
  }, []);

  const loadLearnerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "Sign in to view your learning progress", variant: "destructive" });
        return;
      }

      // Get learner progress
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_learner_progress', { learner_user_id: user.id });

      if (progressError) throw progressError;
      
      if (progressData && progressData.length > 0) {
        setStats(progressData[0]);
      }

      // Get personalized recommendations
      const { data: recData, error: recError } = await supabase
        .rpc('get_personalized_recommendations', { 
          learner_user_id: user.id, 
          recommendation_count: 6 
        });

      if (recError) throw recError;
      setRecommendations(recData || []);

    } catch (error: any) {
      console.error('Error loading learner data:', error);
      toast({ 
        title: "Error", 
        description: "Could not load your learning data", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Welcome to Your Learning Journey
            </CardTitle>
            <CardDescription>
              Start learning Goji to see your personalized dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalVocabulary = stats.vocabulary_mastered + stats.vocabulary_learning + stats.vocabulary_familiar;
  const masteryPercentage = totalVocabulary > 0 ? (stats.vocabulary_mastered / totalVocabulary) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and discover new Goji words</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Mastered</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.vocabulary_mastered}</div>
            <p className="text-xs text-muted-foreground">
              {masteryPercentage.toFixed(1)}% mastery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.vocabulary_learning}</div>
            <p className="text-xs text-muted-foreground">
              Words in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.total_study_time_minutes / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Total study time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.streak_days}</div>
            <p className="text-xs text-muted-foreground">
              Day streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Vocabulary Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mastered</span>
                <span className="text-green-600">{stats.vocabulary_mastered}</span>
              </div>
              <Progress value={masteryPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Familiar</span>
                <span className="text-blue-600">{stats.vocabulary_familiar}</span>
              </div>
              <Progress 
                value={totalVocabulary > 0 ? (stats.vocabulary_familiar / totalVocabulary) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Learning</span>
                <span className="text-orange-600">{stats.vocabulary_learning}</span>
              </div>
              <Progress 
                value={totalVocabulary > 0 ? (stats.vocabulary_learning / totalVocabulary) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Pronunciation Score</h4>
              <div className="flex items-center gap-2">
                <Progress value={stats.average_pronunciation_score * 100} className="flex-1" />
                <span className="text-sm font-medium">
                  {(stats.average_pronunciation_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            {stats.preferred_topics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.preferred_topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {stats.improvement_areas.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Areas to Improve</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.improvement_areas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-orange-600 border-orange-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Words */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Words chosen based on your learning level and interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((word) => (
                <Card key={word.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-primary">{word.goji_word}</h3>
                      <Badge variant="outline" className="text-xs">
                        {word.difficulty_level}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">English:</span> {word.english_translation}</p>
                      {word.hausa_translation && (
                        <p><span className="font-medium">Hausa:</span> {word.hausa_translation}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      {word.recommendation_reason}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Practice This Word
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};