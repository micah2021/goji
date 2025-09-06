import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Target, Zap, Calendar, Award, BookOpen } from "lucide-react";

interface UserStats {
  vocabularyMastered: number;
  vocabularyLearning: number;
  totalStudyTime: number;
  streakDays: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: number;
}

interface RecentActivity {
  date: string;
  wordsLearned: number;
  minutesStudied: number;
  xpGained: number;
}

export const LearningAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    vocabularyMastered: 0,
    vocabularyLearning: 0,
    totalStudyTime: 0,
    streakDays: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    achievements: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Get learner profile
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Get vocabulary mastery stats
      const { data: vocabStats } = await supabase
        .from('vocabulary_mastery')
        .select('mastery_level, confidence_score')
        .eq('user_id', user?.id);

      // Get conversation analytics for study time
      const { data: analytics } = await supabase
        .from('conversation_analytics')
        .select('session_duration_minutes')
        .eq('user_id', user?.id);

      const mastered = vocabStats?.filter(v => v.mastery_level === 'mastered').length || 0;
      const learning = vocabStats?.filter(v => v.mastery_level === 'learning').length || 0;
      const totalMinutes = analytics?.reduce((sum, a) => sum + (a.session_duration_minutes || 0), 0) || 0;
      
      // Calculate level and XP (100 XP per vocabulary word mastered + 10 XP per study hour)
      const vocabXP = mastered * 100;
      const studyXP = Math.floor(totalMinutes / 60) * 10;
      const totalXP = vocabXP + studyXP;
      const level = Math.floor(totalXP / 500) + 1;
      const currentLevelXP = totalXP % 500;
      const xpToNext = 500 - currentLevelXP;

      setStats({
        vocabularyMastered: mastered,
        vocabularyLearning: learning,
        totalStudyTime: totalMinutes,
        streakDays: profile?.streak_days || 0,
        level,
        xp: totalXP,
        xpToNextLevel: xpToNext,
        achievements: Math.floor(mastered / 10) + Math.floor(level / 5) // Simple achievement calc
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Generate mock recent activity for now (in real app, track this in database)
      const mockActivity: RecentActivity[] = [
        { date: 'Today', wordsLearned: 8, minutesStudied: 25, xpGained: 45 },
        { date: 'Yesterday', wordsLearned: 12, minutesStudied: 35, xpGained: 65 },
        { date: '2 days ago', wordsLearned: 6, minutesStudied: 20, xpGained: 30 },
        { date: '3 days ago', wordsLearned: 15, minutesStudied: 40, xpGained: 80 },
        { date: '4 days ago', wordsLearned: 5, minutesStudied: 15, xpGained: 25 },
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your Goji language learning journey</p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.vocabularyMastered}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.vocabularyLearning} currently learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{Math.round(stats.totalStudyTime)} min</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.totalStudyTime / 60)} hours total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Level {stats.level}</div>
            <p className="text-xs text-muted-foreground">
              {stats.xpToNextLevel} XP to next level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Level Progress
                </CardTitle>
                <CardDescription>XP towards next level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Level {stats.level}</span>
                  <span>{500 - stats.xpToNextLevel}/500 XP</span>
                </div>
                <Progress value={((500 - stats.xpToNextLevel) / 500) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Vocabulary Progress
                </CardTitle>
                <CardDescription>Words mastered vs learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mastered: {stats.vocabularyMastered}</span>
                    <span>Learning: {stats.vocabularyLearning}</span>
                  </div>
                  <Progress 
                    value={stats.vocabularyMastered + stats.vocabularyLearning > 0 
                      ? (stats.vocabularyMastered / (stats.vocabularyMastered + stats.vocabularyLearning)) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Activity</CardTitle>
              <CardDescription>Your daily learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.wordsLearned} words • {activity.minutesStudied} minutes
                      </p>
                    </div>
                    <Badge variant="secondary">+{activity.xpGained} XP</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Milestones you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.vocabularyMastered >= 10 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <Award className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Vocabulary Explorer</p>
                      <p className="text-sm text-muted-foreground">Mastered 10+ words</p>
                    </div>
                  </div>
                )}
                
                {stats.streakDays >= 7 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Week Warrior</p>
                      <p className="text-sm text-muted-foreground">7-day learning streak</p>
                    </div>
                  </div>
                )}
                
                {stats.level >= 5 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Rising Star</p>
                      <p className="text-sm text-muted-foreground">Reached Level 5</p>
                    </div>
                  </div>
                )}

                {stats.totalStudyTime >= 120 && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Dedicated Learner</p>
                      <p className="text-sm text-muted-foreground">2+ hours of study time</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};