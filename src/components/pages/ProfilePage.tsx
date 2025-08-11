import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContributionForm } from "@/components/community/ContributionForm";
import { ContributionVoting } from "@/components/community/ContributionVoting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Vote, Plus, Trophy, LogOut, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You can now sign in with a different account"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Profile & Community
          </h1>
          <p className="text-muted-foreground">
            Manage your account and contribute to Goji preservation
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {user?.user_metadata?.full_name || 'User'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  {user?.user_metadata?.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {user.user_metadata.location}
                    </div>
                  )}
                  {user?.user_metadata?.username && (
                    <div className="text-sm text-muted-foreground">
                      @{user.user_metadata.username}
                    </div>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {user?.user_metadata?.role || 'member'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Your Contribution Points
            </CardTitle>
            <CardDescription>
              Earn points by contributing words, phrases, and stories to the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                🏆 0 Points
              </Badge>
              <p className="text-sm text-muted-foreground">
                Sign in and start contributing to earn points!
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="contribute" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contribute" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Contribute
            </TabsTrigger>
            <TabsTrigger value="vote" className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Vote & Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contribute" className="mt-6">
            <ContributionForm />
          </TabsContent>

          <TabsContent value="vote" className="mt-6">
            <ContributionVoting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;