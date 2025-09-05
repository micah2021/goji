import { CommunityChat } from "@/components/community/CommunityChat";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Goji Community
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow Goji learners and practice together
          </p>
        </div>

        <CommunityChat />
      </div>
    </div>
  );
};

export default CommunityPage;