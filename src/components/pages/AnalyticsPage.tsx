import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LearnerDashboard } from "@/components/learner/LearnerDashboard";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageSquare,
  Brain,
  Target,
  Award
} from "lucide-react";

interface GlobalStats {
  total_users: number;
  total_dictionary_entries: number;
  total_conversations: number;
  total_audio_recordings: number;
  recent_contributions: number;
}

export const AnalyticsPage = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("member");
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.role) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get global platform statistics
      const [usersResult, entriesResult, conversationsResult, recordingsResult, contributionsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('dictionary_entries').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('audio_recordings').select('id', { count: 'exact', head: true }),
        supabase.from('contributions').select('id').eq('status', 'pending').limit(100)
      ]);

      setStats({
        total_users: usersResult.count || 0,
        total_dictionary_entries: entriesResult.count || 0,
        total_conversations: conversationsResult.count || 0,
        total_audio_recordings: recordingsResult.count || 0,
        recent_contributions: contributionsResult.data?.length || 0
      });

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Could not load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Learning Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and explore platform insights
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Personal Progress
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Platform Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <LearnerDashboard />
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          {/* Platform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.total_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active language learners
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dictionary Words</CardTitle>
                <BookOpen className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.total_dictionary_entries || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Goji words & translations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.total_conversations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI tutor sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audio Practice</CardTitle>
                <Brain className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.total_audio_recordings || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pronunciation recordings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Growth & Community */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Platform Growth
                </CardTitle>
                <CardDescription>
                  Growing community of Goji language learners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community Engagement</span>
                    <span className="font-medium">Growing</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Active learners practicing daily
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Quality</span>
                    <span className="font-medium">Excellent</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    AI-verified vocabulary and cultural content
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Learning Effectiveness</span>
                    <span className="font-medium">High</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Personalized AI tutoring and feedback
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Community Impact
                </CardTitle>
                <CardDescription>
                  Preserving and sharing Goji language heritage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Language Preservation</h4>
                  <p className="text-sm text-muted-foreground">
                    Our platform is helping preserve the Goji language through community 
                    contributions, AI-assisted content generation, and cultural documentation.
                  </p>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Active Contributions</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {stats?.recent_contributions || 0} Pending Reviews
                    </Badge>
                    {userRole === 'admin' && (
                      <Badge variant="outline">Admin Access</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Community members contributing new vocabulary and cultural insights
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cultural Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Connecting Goji speakers worldwide and enabling cultural exchange 
                    through shared stories, traditions, and language learning.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Learning Features</CardTitle>
              <CardDescription>
                Advanced AI-powered tools for accelerated Goji language learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    Semantic Search RAG
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    AI finds contextually relevant vocabulary and cultural information 
                    using vector embeddings and semantic similarity.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    Personalized Learning
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Adaptive recommendations based on your progress, interests, 
                    and learning patterns with vocabulary mastery tracking.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Enhanced Audio Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced pronunciation analysis with detailed AI feedback 
                    and improvement suggestions for better learning outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};