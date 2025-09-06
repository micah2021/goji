import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award, Target, Flame, MessageCircle, Heart } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  total_points: number;
  words_mastered: number;
  current_streak: number;
  posts_count: number;
  likes_received: number;
  contributions_approved: number;
  achievements_count: number;
  rank: number;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(20);
      
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇 Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Award className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Target className="h-6 w-6 text-amber-600" />;
    return <div className="h-6 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>
          Top learners and contributors in our community
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No rankings available yet. Start learning to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div 
                key={user.user_id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                  user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg font-bold">
                      {user.display_name?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-lg">{user.display_name || user.username}</div>
                      {getRankBadge(user.rank)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {user.total_points} points
                      </div>
                      <div className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {user.words_mastered} words
                      </div>
                      <div className="flex items-center">
                        <Flame className="h-3 w-3 mr-1" />
                        {user.current_streak} days
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {user.posts_count}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {user.likes_received}
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      {user.achievements_count}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.contributions_approved} contributions approved
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};