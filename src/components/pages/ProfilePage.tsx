import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Mic, BookOpen } from "lucide-react";

const ProfilePage = () => {
  // Sample user data - will be replaced with actual user data
  const userData = {
    name: "Language Learner",
    points: 850,
    level: "Bronze Contributor",
    contributions: {
      recordings: 12,
      corrections: 8,
      translations: 15
    },
    badges: [
      { id: 1, name: "First Recording", nameHa: "Rikodin Farko", icon: Mic },
      { id: 2, name: "Word Explorer", nameHa: "Mai Binciken Kalmomi", icon: BookOpen },
    ]
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">
            {userData.name.charAt(0)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{userData.name}</h1>
          <p className="text-muted-foreground">{userData.level}</p>
        </div>
      </div>

      <Card className="p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-bold text-foreground">{userData.points}</span>
        </div>
        <p className="text-sm text-muted-foreground">Total Points • Jimlar Maki</p>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Contributions • Gudummawa</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{userData.contributions.recordings}</div>
            <div className="text-xs text-muted-foreground">Recordings</div>
            <div className="text-xs text-muted-foreground">Rikodin</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{userData.contributions.corrections}</div>
            <div className="text-xs text-muted-foreground">Corrections</div>
            <div className="text-xs text-muted-foreground">Gyare-gyare</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xl font-bold text-foreground">{userData.contributions.translations}</div>
            <div className="text-xs text-muted-foreground">Translations</div>
            <div className="text-xs text-muted-foreground">Fassarori</div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Badges • Tambari</h2>
        <div className="grid grid-cols-2 gap-3">
          {userData.badges.map((badge) => (
            <Card key={badge.id} className="p-3 text-center">
              <badge.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{badge.name}</h3>
              <p className="text-xs text-muted-foreground">{badge.nameHa}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Leaderboard • Jerin Gaba</h2>
        <Card className="p-4">
          <div className="space-y-3">
            {[
              { rank: 1, name: "Aisha M.", points: 1250 },
              { rank: 2, name: "Musa K.", points: 980 },
              { rank: 3, name: "You", points: userData.points },
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                    {user.rank}
                  </span>
                  <span className={`text-sm ${user.name === "You" ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{user.points}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;