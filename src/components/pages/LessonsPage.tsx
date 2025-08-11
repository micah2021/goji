import { useState } from "react";
import { BookOpen, Play, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  titleHa: string;
  description: string;
  descriptionHa: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
}

const LessonsPage = () => {
  const [lessons] = useState<Lesson[]>([
    {
      id: "1",
      title: "Basic Greetings",
      titleHa: "Gaisuwar Asali",
      description: "Learn essential greetings in Goji",
      descriptionHa: "Koyi muhimman gaisuwa a Goji",
      difficulty: 'beginner',
      duration: "10 min",
      isCompleted: true,
      isLocked: false,
      progress: 100
    },
    {
      id: "2", 
      title: "Family Terms",
      titleHa: "Kalmomin Iyali",
      description: "Words for family members",
      descriptionHa: "Kalmomi na 'yan uwa",
      difficulty: 'beginner',
      duration: "15 min",
      isCompleted: false,
      isLocked: false,
      progress: 60
    },
    {
      id: "3",
      title: "Food & Cooking",
      titleHa: "Abinci da Dafawa",
      description: "Learn food-related vocabulary",
      descriptionHa: "Koyi kalmomi na abinci",
      difficulty: 'intermediate',
      duration: "20 min",
      isCompleted: false,
      isLocked: true,
      progress: 0
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { en: 'Beginner', ha: 'Mafari' };
      case 'intermediate': return { en: 'Intermediate', ha: 'Matsakaici' };
      case 'advanced': return { en: 'Advanced', ha: 'Babba' };
      default: return { en: 'Unknown', ha: 'Babu' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Goji Lessons</h1>
          <p className="text-sm text-muted-foreground">
            Interactive lessons • Darussan hulɗa
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Your Progress</h3>
              <p className="text-sm text-muted-foreground">Ci gaban ku</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">1/3</p>
              <p className="text-xs text-muted-foreground">Lessons Complete</p>
            </div>
          </div>
          <Progress value={33} className="mt-3" />
        </div>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => {
          const difficultyLabel = getDifficultyLabel(lesson.difficulty);
          
          return (
            <Card key={lesson.id} className={`p-4 transition-all duration-200 ${
              lesson.isLocked ? 'opacity-60' : 'hover:shadow-md'
            }`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      lesson.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : lesson.isLocked 
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {lesson.isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : lesson.isLocked ? (
                        <Lock className="h-6 w-6" />
                      ) : (
                        <BookOpen className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lesson.titleHa}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lesson.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.descriptionHa}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="secondary" className={`${getDifficultyColor(lesson.difficulty)} text-white`}>
                      {difficultyLabel.en}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {lesson.duration}
                    </span>
                  </div>
                </div>
                
                {!lesson.isCompleted && !lesson.isLocked && lesson.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    disabled={lesson.isLocked}
                    variant={lesson.isCompleted ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {lesson.isCompleted ? "Review • Nazarta" : lesson.isLocked ? "Locked • Kulle" : "Start • Fara"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="bg-secondary/30 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          More lessons coming soon! • Ƙarin darussai suna zuwa nan ba da daɗewa ba!
        </p>
      </div>
    </div>
  );
};

export default LessonsPage;