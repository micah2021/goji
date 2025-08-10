import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContributionForm } from "@/components/community/ContributionForm";
import { ContributionVoting } from "@/components/community/ContributionVoting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Vote, Plus, Trophy } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Contribute to the Goji language preservation effort
          </p>
        </div>

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