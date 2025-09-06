import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Award, Zap, Target, Trophy, Star, Gift, Users, Flame, CheckCircle } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  xpReward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  expiresAt: Date;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  streakDays: number;
  rank: number;
  totalUsers: number;
}

export const GamificationSystem = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalXP: 0,
    streakDays: 0,
    rank: 1,
    totalUsers: 1
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateUserStats();
      generateAchievements();
      generateDailyChallenges();
    }
  }, [user]);

  const calculateUserStats = async () => {
    try {
      // Get vocabulary mastery for XP calculation
      const { data: vocabData } = await supabase
        .from('vocabulary_mastery')
        .select('mastery_level, total_attempts')
        .eq('user_id', user?.id);

      // Get study time from analytics
      const { data: analyticsData } = await supabase
        .from('conversation_analytics')
        .select('session_duration_minutes')
        .eq('user_id', user?.id);

      // Get learner profile for streak
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('streak_days')
        .eq('user_id', user?.id)
        .single();

      const masteredWords = vocabData?.filter(v => v.mastery_level === 'mastered').length || 0;
      const totalAttempts = vocabData?.reduce((sum, v) => sum + (v.total_attempts || 0), 0) || 0;
      const totalMinutes = analyticsData?.reduce((sum, a) => sum + (a.session_duration_minutes || 0), 0) || 0;

      // XP Calculation: 50 XP per mastered word + 5 XP per study hour + 2 XP per vocabulary attempt
      const vocabXP = masteredWords * 50;
      const studyXP = Math.floor(totalMinutes / 60) * 5;
      const practiceXP = totalAttempts * 2;
      const totalXP = vocabXP + studyXP + practiceXP;

      // Level calculation (every 200 XP = 1 level)
      const level = Math.floor(totalXP / 200) + 1;
      const currentLevelXP = totalXP % 200;
      const xpToNext = 200 - currentLevelXP;

      setUserStats({
        level,
        xp: currentLevelXP,
        xpToNext,
        totalXP,
        streakDays: profile?.streak_days || 0,
        rank: Math.floor(Math.random() * 50) + 1, // Mock ranking
        totalUsers: 127 // Mock total users
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = async () => {
    try {
      // Get user's current progress
      const { data: vocabData } = await supabase
        .from('vocabulary_mastery')
        .select('*')
        .eq('user_id', user?.id);

      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const masteredCount = vocabData?.filter(v => v.mastery_level === 'mastered').length || 0;
      const streakDays = profile?.streak_days || 0;

      const allAchievements: Achievement[] = [
        {
          id: 'first-word',
          title: 'First Steps',
          description: 'Master your first Goji word',
          icon: '🌱',
          xpReward: 25,
          unlocked: masteredCount >= 1,
          progress: Math.min(masteredCount, 1),
          maxProgress: 1,
          rarity: 'common'
        },
        {
          id: 'vocab-explorer',
          title: 'Vocabulary Explorer',
          description: 'Master 25 Goji words',
          icon: '📚',
          xpReward: 100,
          unlocked: masteredCount >= 25,
          progress: Math.min(masteredCount, 25),
          maxProgress: 25,
          rarity: 'rare'
        },
        {
          id: 'word-master',
          title: 'Word Master',
          description: 'Master 100 Goji words',
          icon: '🎓',
          xpReward: 500,
          unlocked: masteredCount >= 100,
          progress: Math.min(masteredCount, 100),
          maxProgress: 100,
          rarity: 'epic'
        },
        {
          id: 'streak-starter',
          title: 'Streak Starter',
          description: 'Maintain a 7-day learning streak',
          icon: '🔥',
          xpReward: 75,
          unlocked: streakDays >= 7,
          progress: Math.min(streakDays, 7),
          maxProgress: 7,
          rarity: 'common'
        },
        {
          id: 'dedication-master',
          title: 'Dedication Master',
          description: 'Maintain a 30-day learning streak',
          icon: '⚡',
          xpReward: 300,
          unlocked: streakDays >= 30,
          progress: Math.min(streakDays, 30),
          maxProgress: 30,
          rarity: 'legendary'
        },
        {
          id: 'culture-explorer',
          title: 'Culture Explorer',
          description: 'Complete 5 cultural lessons',
          icon: '🌍',
          xpReward: 150,
          unlocked: false, // Would check cultural lesson progress
          progress: 2,
          maxProgress: 5,
          rarity: 'rare'
        }
      ];

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error generating achievements:', error);
    }
  };

  const generateDailyChallenges = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dailyChallenges: Challenge[] = [
      {
        id: 'daily-vocab',
        title: 'Daily Vocabulary',
        description: 'Practice 10 vocabulary words today',
        type: 'daily',
        xpReward: 25,
        progress: 6,
        maxProgress: 10,
        completed: false,
        expiresAt: tomorrow
      },
      {
        id: 'daily-conversation',
        title: 'Chat Challenge',
        description: 'Have a 5-minute conversation with AI tutor',
        type: 'daily',
        xpReward: 30,
        progress: 0,
        maxProgress: 1,
        completed: false,
        expiresAt: tomorrow
      },
      {
        id: 'weekly-mastery',
        title: 'Weekly Mastery',
        description: 'Master 15 new words this week',
        type: 'weekly',
        xpReward: 100,
        progress: 8,
        maxProgress: 15,
        completed: false,
        expiresAt: nextWeek
      },
      {
        id: 'community-helper',
        title: 'Community Helper',
        description: 'Help answer 3 community questions',
        type: 'weekly',
        xpReward: 75,
        progress: 1,
        maxProgress: 3,
        completed: false,
        expiresAt: nextWeek
      }
    ];

    setChallenges(dailyChallenges);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'rare': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'epic': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'legendary': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'weekly': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'special': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & User Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">Level {userStats.level}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>XP</span>
                  <span>{userStats.xp}/{userStats.xp + userStats.xpToNext}</span>
                </div>
                <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">{userStats.streakDays}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">#{userStats.rank}</div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{userStats.totalXP}</div>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Challenges
          </CardTitle>
          <CardDescription>Complete challenges to earn bonus XP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={getChallengeTypeColor(challenge.type)}>
                      {challenge.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.xpReward} XP
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {challenge.progress}/{challenge.maxProgress}</span>
                    <span className="text-muted-foreground">
                      {formatTimeRemaining(challenge.expiresAt)} left
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.maxProgress) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock achievements by reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.unlocked && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};