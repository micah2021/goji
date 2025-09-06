import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningAnalytics } from "@/components/analytics/LearningAnalytics";
import { LearningPaths } from "@/components/learning/LearningPaths";
import { GamificationSystem } from "@/components/gamification/GamificationSystem";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { BarChart3, Map, Trophy, Users } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Learning Dashboard</h1>
        <p className="text-muted-foreground">Your complete Goji language learning experience</p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
          <LearningAnalytics />
        </TabsContent>
        
        <TabsContent value="paths" className="mt-6">
          <LearningPaths />
        </TabsContent>
        
        <TabsContent value="gamification" className="mt-6">
          <GamificationSystem />
        </TabsContent>
        
        <TabsContent value="community" className="mt-6">
          <CommunityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;