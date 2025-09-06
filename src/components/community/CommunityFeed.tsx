import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Users, Trophy, TrendingUp, Calendar, Star } from "lucide-react";

interface CommunityPost {
  id: string;
  type: 'achievement' | 'question' | 'tip' | 'challenge_completion';
  title: string;
  content: string;
  author: {
    name: string;
    level: number;
    avatar?: string;
  };
  timestamp: Date;
  likes: number;
  replies: number;
  tags: string[];
}

interface Leaderboard {
  rank: number;
  user: {
    name: string;
    level: number;
    avatar?: string;
  };
  xp: number;
  streak: number;
  wordsLearned: number;
}

export const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateCommunityPosts();
      generateLeaderboard();
    }
  }, [user]);

  const generateCommunityPosts = () => {
    // Generate mock community posts (in real app, fetch from database)
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Level Up!',
        content: 'Just reached Level 5! The vocabulary is really clicking now. Sannu da safe to all my fellow learners! 🎉',
        author: { name: 'Sarah M.', level: 5 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 12,
        replies: 3,
        tags: ['achievement', 'level-up']
      },
      {
        id: '2',
        type: 'question',
        title: 'Pronunciation Help',
        content: 'Can someone help me with the tone marking in "biro"? Is it high or low tone on the second syllable?',
        author: { name: 'David K.', level: 2 },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 7,
        replies: 8,
        tags: ['pronunciation', 'help', 'tones']
      },
      {
        id: '3',
        type: 'tip',
        title: 'Learning Tip: Memory Palace',
        content: 'I\'ve been using the memory palace technique for Goji vocabulary. I imagine walking through my grandmother\'s compound and placing objects there. "Telan" (pot) goes in the kitchen, "gburam" (chair) in the sitting area. Try it!',
        author: { name: 'Amina J.', level: 8 },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 23,
        replies: 6,
        tags: ['tip', 'memory', 'vocabulary']
      },
      {
        id: '4',
        type: 'challenge_completion',
        title: '30-Day Streak Complete!',
        content: 'Finally hit my 30-day learning streak! The daily challenges really kept me motivated. Next goal: 50 days! Who wants to join me?',
        author: { name: 'Michael O.', level: 6 },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        likes: 18,
        replies: 12,
        tags: ['streak', 'challenge', 'motivation']
      },
      {
        id: '5',
        type: 'question',
        title: 'Cultural Context Question',
        content: 'I\'m learning about traditional greetings. When do you use "Sannu da safe" vs just "Sannu"? Is there a specific time of day or social context?',
        author: { name: 'Lisa R.', level: 3 },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        likes: 9,
        replies: 15,
        tags: ['culture', 'greetings', 'context']
      },
      {
        id: '6',
        type: 'tip',
        title: 'Audio Recording Practice',
        content: 'Pro tip: Record yourself saying Goji words and play them back. I was mispronouncing "wi" (goat) for weeks until I heard myself! The AI tutor is great, but self-reflection helps too.',
        author: { name: 'James T.', level: 7 },
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        likes: 16,
        replies: 4,
        tags: ['pronunciation', 'practice', 'audio']
      }
    ];

    setPosts(mockPosts);
  };

  const generateLeaderboard = () => {
    // Generate mock leaderboard (in real app, fetch from database)
    const mockLeaderboard: Leaderboard[] = [
      {
        rank: 1,
        user: { name: 'Amina J.', level: 8 },
        xp: 2340,
        streak: 45,
        wordsLearned: 156
      },
      {
        rank: 2,
        user: { name: 'Michael O.', level: 6 },
        xp: 1890,
        streak: 32,
        wordsLearned: 128
      },
      {
        rank: 3,
        user: { name: 'James T.', level: 7 },
        xp: 1675,
        streak: 28,
        wordsLearned: 142
      },
      {
        rank: 4,
        user: { name: 'Sarah M.', level: 5 },
        xp: 1456,
        streak: 25,
        wordsLearned: 98
      },
      {
        rank: 5,
        user: { name: 'David K.', level: 2 },
        xp: 1200,
        streak: 18,
        wordsLearned: 76
      },
      {
        rank: 6,
        user: { name: 'You', level: 3 }, // Current user
        xp: 890,
        streak: 12,
        wordsLearned: 54
      }
    ];

    setLeaderboard(mockLeaderboard);
    setLoading(false);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'tip': return <Star className="h-4 w-4 text-green-500" />;
      case 'challenge_completion': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'question': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'tip': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'challenge_completion': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading community feed...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Community Hub</h1>
        <p className="text-muted-foreground">Connect with fellow Goji learners worldwide</p>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{post.author.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Level {post.author.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getPostTypeColor(post.type)}>
                        <div className="flex items-center gap-1">
                          {getPostTypeIcon(post.type)}
                          {post.type.replace('_', ' ')}
                        </div>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.replies}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">127</div>
                    <p className="text-sm text-muted-foreground">Active Learners</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1,044</div>
                    <p className="text-sm text-muted-foreground">Words in Dictionary</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">89</div>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.slice(0, 3).map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-2">
                      <div className="text-sm font-medium">#{entry.rank}</div>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {entry.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.user.name}</p>
                        <p className="text-xs text-muted-foreground">Level {entry.user.level}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {entry.xp} XP
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top Goji language learners this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank} 
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      entry.user.name === 'You' ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`text-lg font-bold ${
                        entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        #{entry.rank}
                      </div>
                    </div>
                    
                    <Avatar>
                      <AvatarFallback>
                        {entry.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{entry.user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Level {entry.user.level}
                        </Badge>
                        {entry.rank <= 3 && (
                          <Trophy className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{entry.xp} XP</span>
                        <span>🔥 {entry.streak}d</span>
                        <span>📚 {entry.wordsLearned} words</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Community Challenges Coming Soon!</h3>
            <p className="text-muted-foreground mb-4">
              Join weekly group challenges, language competitions, and collaborative learning events.
            </p>
            <Button disabled>
              View Active Challenges
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};