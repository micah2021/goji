import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp, 
  Clock, 
  Award,
  BookOpen,
  Star
} from "lucide-react";

interface CommunityStats {
  total_contributors: number;
  total_posts: number;
  total_replies: number;
  total_likes: number;
  posts_this_week: number;
  posts_today: number;
}

interface TopContributor {
  user_id: string;
  username: string;
  display_name: string;
  contribution_count: number;
  total_likes: number;
}

export const CommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTopContributors();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('community_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('user_id, username, display_name, posts_count, likes_received')
        .order('posts_count', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setTopContributors((data || []).map(user => ({
        user_id: user.user_id,
        username: user.username,
        display_name: user.display_name,
        contribution_count: user.posts_count,
        total_likes: user.likes_received
      })));
    } catch (error) {
      console.error('Error fetching top contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total_contributors}</div>
                  <div className="text-xs text-muted-foreground">Contributors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total_posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total_replies}</div>
                  <div className="text-xs text-muted-foreground">Replies</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total_likes}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.posts_this_week}</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.posts_today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            Most active community members this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topContributors.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contributors yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={contributor.user_id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{contributor.display_name || contributor.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {contributor.contribution_count} posts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {contributor.total_likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Posts this week</span>
                <span className="font-bold">{stats?.posts_this_week || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Posts today</span>
                <span className="font-bold">{stats?.posts_today || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg replies per post</span>
                <span className="font-bold">
                  {stats && stats.total_posts > 0 
                    ? (stats.total_replies / stats.total_posts).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg likes per post</span>
                <span className="font-bold">
                  {stats && stats.total_posts > 0 
                    ? (stats.total_likes / stats.total_posts).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Community Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active contributors</span>
                <span className="font-bold text-green-600">{stats?.total_contributors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total interactions</span>
                <span className="font-bold text-blue-600">
                  {(stats?.total_likes || 0) + (stats?.total_replies || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Community growth</span>
                <span className="font-bold text-purple-600">Growing 📈</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Engagement level</span>
                <span className="font-bold text-orange-600">
                  {stats && stats.total_posts > 0 && ((stats.total_likes + stats.total_replies) / stats.total_posts) > 2 
                    ? 'High 🚀' 
                    : 'Building 🌱'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};