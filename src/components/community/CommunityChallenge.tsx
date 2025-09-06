import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Trophy, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  Flame,
  Award,
  BookOpen,
  Plus
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'vocabulary' | 'community' | 'streak' | 'cultural';
  start_date: string;
  end_date: string;
  target_value: number;
  current_progress: number;
  max_participants: number;
  current_participants: number;
  reward_xp: number;
  status: 'upcoming' | 'active' | 'completed';
  participants: Array<{
    user_id: string;
    username: string;
    display_name: string;
    progress: number;
    joined_at: string;
  }>;
}

interface UserChallengeProgress {
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  joined_at: string;
}

export const CommunityChallenge = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateChallenges();
  }, []);

  const generateChallenges = () => {
    // Generate mock challenges (in real app, these would come from database)
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Weekly Vocabulary Sprint',
        description: 'Learn 50 new Goji words this week. Focus on everyday objects and family terms.',
        challenge_type: 'vocabulary',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        target_value: 50,
        current_progress: 23,
        max_participants: 100,
        current_participants: 45,
        reward_xp: 200,
        status: 'active',
        participants: [
          { user_id: '1', username: 'amina_j', display_name: 'Amina J.', progress: 47, joined_at: new Date().toISOString() },
          { user_id: '2', username: 'michael_o', display_name: 'Michael O.', progress: 42, joined_at: new Date().toISOString() },
          { user_id: '3', username: 'sarah_m', display_name: 'Sarah M.', progress: 38, joined_at: new Date().toISOString() },
        ]
      },
      {
        id: '2',
        title: 'Community Helper Challenge',
        description: 'Help 10 community members by answering questions or providing tips. Spread the knowledge!',
        challenge_type: 'community',
        start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        target_value: 10,
        current_progress: 7,
        max_participants: 50,
        current_participants: 28,
        reward_xp: 150,
        status: 'active',
        participants: [
          { user_id: '1', username: 'james_t', display_name: 'James T.', progress: 8, joined_at: new Date().toISOString() },
          { user_id: '2', username: 'lisa_r', display_name: 'Lisa R.', progress: 6, joined_at: new Date().toISOString() },
          { user_id: '3', username: 'david_k', display_name: 'David K.', progress: 4, joined_at: new Date().toISOString() },
        ]
      },
      {
        id: '3',
        title: 'Cultural Explorer',
        description: 'Discover and share 5 cultural contexts or traditional stories from Goji heritage.',
        challenge_type: 'cultural',
        start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        target_value: 5,
        current_progress: 0,
        max_participants: 30,
        current_participants: 12,
        reward_xp: 300,
        status: 'upcoming',
        participants: []
      },
      {
        id: '4',
        title: '30-Day Streak Master',
        description: 'Maintain a 30-day learning streak. Consistency is key to language mastery!',
        challenge_type: 'streak',
        start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        target_value: 30,
        current_progress: 5,
        max_participants: 200,
        current_participants: 67,
        reward_xp: 500,
        status: 'active',
        participants: [
          { user_id: '1', username: 'amina_j', display_name: 'Amina J.', progress: 28, joined_at: new Date().toISOString() },
          { user_id: '2', username: 'michael_o', display_name: 'Michael O.', progress: 15, joined_at: new Date().toISOString() },
          { user_id: '3', username: 'emma_l', display_name: 'Emma L.', progress: 22, joined_at: new Date().toISOString() },
        ]
      }
    ];

    setChallenges(mockChallenges);
    setLoading(false);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to join challenges",
        variant: "destructive"
      });
      return;
    }

    // In real app, this would insert into challenge_participants table
    toast({
      title: "Challenge Joined! 🎯",
      description: "You've successfully joined the challenge. Good luck!",
    });

    // Update local state
    setChallenges(challenges.map(challenge => 
      challenge.id === challengeId 
        ? { 
            ...challenge, 
            current_participants: challenge.current_participants + 1,
            participants: [...challenge.participants, {
              user_id: user.id,
              username: user.email?.split('@')[0] || 'user',
              display_name: user.email?.split('@')[0] || 'User',
              progress: 0,
              joined_at: new Date().toISOString()
            }]
          }
        : challenge
    ));
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'community': return <Users className="h-5 w-5 text-green-500" />;
      case 'cultural': return <Award className="h-5 w-5 text-purple-500" />;
      case 'streak': return <Flame className="h-5 w-5 text-orange-500" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'community': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'cultural': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'streak': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">🟢 Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500">🔵 Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">⚫ Completed</Badge>;
      default:
        return <Badge variant="outline">Status Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Community Challenges
        </h2>
        <p className="text-muted-foreground">
          Join challenges, compete with friends, and unlock achievements together!
        </p>
      </div>

      <div className="grid gap-6">
        {challenges.map((challenge) => {
          const isParticipating = challenge.participants.some(p => p.user_id === user?.id);
          const userProgress = challenge.participants.find(p => p.user_id === user?.id);
          const progressPercentage = (challenge.current_progress / challenge.target_value) * 100;
          const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={challenge.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getChallengeIcon(challenge.challenge_type)}
                    <div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {challenge.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(challenge.status)}
                    <Badge variant="outline" className={getChallengeTypeColor(challenge.challenge_type)}>
                      {challenge.challenge_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Challenge Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Community Progress</span>
                    <span className="font-medium">
                      {challenge.current_progress} / {challenge.target_value}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(progressPercentage)}% completed
                  </div>
                </div>

                {/* Challenge Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-lg font-bold">{challenge.current_participants}</div>
                    <div className="text-xs text-muted-foreground">Participants</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-lg font-bold">
                      {challenge.status === 'active' ? `${daysLeft}d` : challenge.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {challenge.status === 'active' ? 'Days Left' : 'Status'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="text-lg font-bold">{challenge.reward_xp}</div>
                    <div className="text-xs text-muted-foreground">XP Reward</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-lg font-bold">{challenge.target_value}</div>
                    <div className="text-xs text-muted-foreground">Target</div>
                  </div>
                </div>

                {/* User's Progress (if participating) */}
                {isParticipating && userProgress && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Your Progress</span>
                        <Badge variant="outline">
                          {userProgress.progress} / {challenge.target_value}
                        </Badge>
                      </div>
                      <Progress 
                        value={(userProgress.progress / challenge.target_value) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((userProgress.progress / challenge.target_value) * 100)}% complete
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Participants */}
                {challenge.participants.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Top Participants</h4>
                    <div className="space-y-2">
                      {challenge.participants
                        .sort((a, b) => b.progress - a.progress)
                        .slice(0, 3)
                        .map((participant, index) => (
                          <div key={participant.user_id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                #{index + 1}
                              </div>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {participant.display_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {participant.display_name}
                                {participant.user_id === user?.id && ' (You)'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {participant.progress} / {challenge.target_value}
                              </Badge>
                              {participant.progress >= challenge.target_value && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {challenge.status === 'upcoming' ? (
                    <Button disabled className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Starts {format(new Date(challenge.start_date), 'MMM d')}
                    </Button>
                  ) : challenge.status === 'completed' ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Challenge Completed
                    </Button>
                  ) : isParticipating ? (
                    <Button variant="outline" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Continue Challenge
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => joinChallenge(challenge.id)} 
                      className="w-full"
                      disabled={challenge.current_participants >= challenge.max_participants}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {challenge.current_participants >= challenge.max_participants 
                        ? 'Challenge Full' 
                        : 'Join Challenge'
                      }
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Your Own Challenge */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto text-purple-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create Your Own Challenge</h3>
          <p className="text-muted-foreground mb-4">
            Have an idea for a community challenge? Submit your proposal and help the community grow!
          </p>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Propose Challenge
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};