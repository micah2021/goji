import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUploadDialog from "@/components/ui/image-upload-dialog";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Trophy, 
  TrendingUp, 
  Users, 
  Star,
  Award,
  Target,
  Clock,
  ImageIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommunityChallenge } from "./CommunityChallenge";

interface CommunityPost {
  id: string;
  user_id: string;
  post_type: string;
  title: string;
  content: string;
  media_url?: string;
  tags: string[];
  likes_count: number;
  replies_count: number;
  is_featured: boolean;
  created_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
  user_liked?: boolean;
}

interface CommunityStats {
  total_contributors: number;
  total_posts: number;
  total_replies: number;
  total_likes: number;
  posts_this_week: number;
  posts_today: number;
}

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

export const CommunityFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    post_type: "post",
    tags: "",
    media_url: ""
  });
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPosts(),
      fetchStats(),
      fetchLeaderboard(),
      fetchRecentAchievements()
    ]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(p => p.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, display_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

        // Check which posts current user has liked
        let likedPostIds = new Set();
        if (user) {
          const postIds = data.map(p => p.id);
          const { data: userLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
        }
        
        const postsWithProfiles = data.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
          profiles: profilesMap.get(post.user_id) || null
        }));
        
        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('community_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchRecentAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .order('unlocked_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(a => a.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, display_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const achievementsWithProfiles = data.map(achievement => ({
          ...achievement,
          profiles: profilesMap.get(achievement.user_id) || null
        }));
        
        setAchievements(achievementsWithProfiles);
      } else {
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: newPost.title,
          content: newPost.content,
          post_type: newPost.post_type,
          media_url: newPost.media_url || null,
          tags
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been created",
      });

      setNewPost({ title: "", content: "", post_type: "post", tags: "", media_url: "" });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentlyLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1,
              user_liked: !currentlyLiked
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-gold" />;
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 #1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 #2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">🥉 #3</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Connect, learn, and grow together</p>
        </div>
        
        {user && (
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, tips, or achievements with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Post Type</label>
                  <select 
                    value={newPost.post_type}
                    onChange={(e) => setNewPost({...newPost, post_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="post">General Post</option>
                    <option value="tip">Learning Tip</option>
                    <option value="question">Question</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="What's your post about?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Share your thoughts..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                    placeholder="goji, vocabulary, culture"
                  />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium">Add Image (optional)</label>
                  <div className="flex gap-2 mt-1">
                    <ImageUploadDialog
                      onUploadComplete={(imageUrl, caption) => {
                        setNewPost(prev => ({ 
                          ...prev, 
                          media_url: imageUrl,
                          content: caption ? `${prev.content}\n\n${caption}` : prev.content
                        }));
                        toast({
                          title: "Success",
                          description: "Image attached to post!"
                        });
                      }}
                      triggerButton={
                        <Button variant="outline" type="button">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Add Image
                        </Button>
                      }
                    />
                    {newPost.media_url && (
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, media_url: "" }))}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  
                  {newPost.media_url && (
                    <div className="mt-2">
                      <img 
                        src={newPost.media_url} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <Button onClick={createPost} className="w-full">
                  Create Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Community Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_contributors}</div>
                <div className="text-xs text-muted-foreground">Contributors</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_replies}</div>
                <div className="text-xs text-muted-foreground">Replies</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_likes}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.posts_this_week}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold">{stats.posts_today}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="featured">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                {user && (
                  <Button onClick={() => setShowCreatePost(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          {getPostIcon(post.post_type)}
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {post.is_featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        </div>
                        <CardDescription>
                          by {post.profiles?.display_name || post.profiles?.username || 'Anonymous'} • 
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.media_url && (
                    <div className="mb-4">
                      <img 
                        src={post.media_url} 
                        alt="Post image" 
                        className="w-full max-w-md h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(post.media_url, '_blank')}
                      />
                    </div>
                  )}
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id, post.user_liked || false)}
                        className={post.user_liked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.replies_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
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
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankBadge(user.rank)}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {user.display_name?.[0] || user.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{user.display_name || user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.total_points} points • {user.words_mastered} words mastered
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        🔥 {user.current_streak} day streak
                      </div>
                      <div className="text-sm text-muted-foreground">
                        💬 {user.posts_count} posts • ❤️ {user.likes_received} likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-500" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Latest accomplishments from our community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No achievements yet. Keep learning to unlock yours!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <Badge variant="outline">+{achievement.points_earned} XP</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Unlocked by {achievement.profiles?.display_name || achievement.profiles?.username || 'Someone'} • 
                          {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <CommunityChallenge />
        </TabsContent>
      </Tabs>
    </div>
  );
};