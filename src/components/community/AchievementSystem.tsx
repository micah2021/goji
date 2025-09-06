import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Award, Trophy, Star, Target, Flame, Users, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_level: number;
  title: string;
  description: string;
  icon: string;
  points_earned: number;
  unlocked_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
}

interface UserAchievement extends Achievement {
  is_current_user: boolean;
}

export const AchievementSystem = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    if (user) {
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          profiles!user_achievements_user_id_fkey(username, display_name)
        `)
        .order('unlocked_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const achievementsWithUserFlag = (data || []).map(achievement => ({
        ...achievement,
        is_current_user: user ? achievement.user_id === user.id : false
      }));
      
      setAchievements(achievementsWithUserFlag);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-amber-600'; // Bronze
      case 2: return 'bg-gray-400'; // Silver
      case 3: return 'bg-yellow-500'; // Gold
      case 4: return 'bg-purple-500'; // Diamond
      default: return 'bg-blue-500';
    }
  };

  const getAchievementLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Bronze';
      case 2: return 'Silver';
      case 3: return 'Gold';
      case 4: return 'Diamond';
      default: return 'Special';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'vocabulary_master': return <BookOpen className="h-5 w-5" />;
      case 'community_contributor': return <Users className="h-5 w-5" />;
      case 'streak_keeper': return <Flame className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User's Achievements */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              {userAchievements.length > 0 
                ? `You've unlocked ${userAchievements.length} achievements!`
                : "Start learning to unlock your first achievement!"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAchievements.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">Keep learning and participating to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAchievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">{achievement.icon}</div>
                      <Badge className={getAchievementLevelColor(achievement.achievement_level)}>
                        {getAchievementLevelName(achievement.achievement_level)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        +{achievement.points_earned} XP
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Community Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-500" />
            Recent Community Achievements
          </CardTitle>
          <CardDescription>
            Latest accomplishments from our community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No achievements yet. Be the first to unlock one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    achievement.is_current_user ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    {getAchievementIcon(achievement.achievement_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <Badge className={getAchievementLevelColor(achievement.achievement_level)}>
                        {getAchievementLevelName(achievement.achievement_level)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.points_earned} XP
                      </Badge>
                      {achievement.is_current_user && (
                        <Badge className="bg-blue-500">You!</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{achievement.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {achievement.profiles?.display_name?.[0] || achievement.profiles?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {achievement.profiles?.display_name || achievement.profiles?.username || 'Someone'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};