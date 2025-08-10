import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contribution {
  id: string;
  type: string;
  goji_text: string;
  english_translation: string;
  hausa_translation?: string;
  example_sentence?: string;
  cultural_context?: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
}

export const ContributionVoting = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedContributions, setVotedContributions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchContributions();
    fetchUserVotes();
  }, []);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from("contributions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      toast({
        title: "Error loading contributions",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contribution_votes")
        .select("contribution_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setVotedContributions(new Set(data.map(vote => vote.contribution_id)));
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  const handleVote = async (contributionId: string, voteType: "for" | "against") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("contribution_votes")
        .insert([{
          contribution_id: contributionId,
          user_id: user.id,
          vote_type: voteType,
        }]);

      if (error) throw error;

      setVotedContributions(prev => new Set(prev).add(contributionId));
      await fetchContributions(); // Refresh to show updated vote counts

      toast({
        title: "Vote recorded",
        description: `Thank you for voting ${voteType} this contribution!`,
      });
    } catch (error) {
      toast({
        title: "Error recording vote",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading contributions...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Community Voting</h2>
      <p className="text-muted-foreground">
        Help review and approve contributions to the Goji language database
      </p>

      {contributions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No pending contributions to review at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        contributions.map((contribution) => (
          <Card key={contribution.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contribution.goji_text}</CardTitle>
                <Badge variant="outline">{contribution.type}</Badge>
              </div>
              <CardDescription>
                English: {contribution.english_translation}
                {contribution.hausa_translation && (
                  <span className="block">Hausa: {contribution.hausa_translation}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contribution.example_sentence && (
                <div>
                  <strong>Example:</strong> {contribution.example_sentence}
                </div>
              )}
              {contribution.cultural_context && (
                <div>
                  <strong>Cultural Context:</strong> {contribution.cultural_context}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    👍 {contribution.votes_for} | 👎 {contribution.votes_against}
                  </span>
                </div>
                
                {!votedContributions.has(contribution.id) && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(contribution.id, "for")}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(contribution.id, "against")}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};