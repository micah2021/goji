import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Circle, Play, Lock, Users, Star, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  vocabularyCount: number;
  completed: boolean;
  locked: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  lessons: Lesson[];
}

export const LearningPaths = () => {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  useEffect(() => {
    if (user) {
      fetchUserLevel();
      generateLearningPaths();
    }
  }, [user]);

  const fetchUserLevel = async () => {
    try {
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('learning_level, vocabulary_mastery_count')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setUserLevel(profile.learning_level as 'beginner' | 'intermediate' | 'advanced');
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
    }
  };

  const generateLearningPaths = () => {
    // Generate structured learning paths
    const learningPaths: LearningPath[] = [
      {
        id: 'beginner-fundamentals',
        title: 'Goji Fundamentals',
        description: 'Master the basics of Goji language with essential vocabulary and simple phrases',
        difficulty: 'beginner',
        totalLessons: 8,
        completedLessons: 2, // Mock completion
        estimatedHours: 4,
        lessons: [
          { id: '1', title: 'Greetings & Introductions', description: 'Learn basic Goji greetings', difficulty: 'beginner', estimatedTime: 20, vocabularyCount: 8, completed: true, locked: false },
          { id: '2', title: 'Family Members', description: 'Words for family relationships', difficulty: 'beginner', estimatedTime: 25, vocabularyCount: 12, completed: true, locked: false },
          { id: '3', title: 'Numbers 1-20', description: 'Counting in Goji', difficulty: 'beginner', estimatedTime: 30, vocabularyCount: 20, completed: false, locked: false },
          { id: '4', title: 'Common Objects', description: 'Household and daily items', difficulty: 'beginner', estimatedTime: 35, vocabularyCount: 15, completed: false, locked: false },
          { id: '5', title: 'Animals & Nature', description: 'Wildlife and natural elements', difficulty: 'beginner', estimatedTime: 30, vocabularyCount: 18, completed: false, locked: true },
          { id: '6', title: 'Colors & Descriptions', description: 'Descriptive words and colors', difficulty: 'beginner', estimatedTime: 25, vocabularyCount: 10, completed: false, locked: true },
          { id: '7', title: 'Basic Verbs', description: 'Common action words', difficulty: 'beginner', estimatedTime: 40, vocabularyCount: 20, completed: false, locked: true },
          { id: '8', title: 'Simple Conversations', description: 'Put it all together', difficulty: 'beginner', estimatedTime: 45, vocabularyCount: 25, completed: false, locked: true },
        ]
      },
      {
        id: 'intermediate-conversation',
        title: 'Conversational Goji',
        description: 'Build confidence in speaking and understanding everyday conversations',
        difficulty: 'intermediate',
        totalLessons: 10,
        completedLessons: 0,
        estimatedHours: 6,
        lessons: [
          { id: '9', title: 'Shopping & Markets', description: 'Vocabulary for buying and selling', difficulty: 'intermediate', estimatedTime: 35, vocabularyCount: 20, completed: false, locked: userLevel === 'beginner' },
          { id: '10', title: 'Directions & Places', description: 'Navigate and describe locations', difficulty: 'intermediate', estimatedTime: 40, vocabularyCount: 25, completed: false, locked: userLevel === 'beginner' },
          { id: '11', title: 'Weather & Seasons', description: 'Discuss climate and time', difficulty: 'intermediate', estimatedTime: 30, vocabularyCount: 15, completed: false, locked: userLevel === 'beginner' },
          { id: '12', title: 'Food & Cooking', description: 'Culinary vocabulary and traditions', difficulty: 'intermediate', estimatedTime: 45, vocabularyCount: 30, completed: false, locked: userLevel === 'beginner' },
          { id: '13', title: 'Work & Occupations', description: 'Professional and trade vocabulary', difficulty: 'intermediate', estimatedTime: 35, vocabularyCount: 22, completed: false, locked: userLevel === 'beginner' },
        ]
      },
      {
        id: 'advanced-culture',
        title: 'Cultural Mastery',
        description: 'Deep dive into Goji culture, traditions, and complex language patterns',
        difficulty: 'advanced',
        totalLessons: 12,
        completedLessons: 0,
        estimatedHours: 10,
        lessons: [
          { id: '14', title: 'Traditional Stories', description: 'Explore Goji folklore and legends', difficulty: 'advanced', estimatedTime: 60, vocabularyCount: 40, completed: false, locked: userLevel !== 'advanced' },
          { id: '15', title: 'Ceremonial Language', description: 'Formal and ritual expressions', difficulty: 'advanced', estimatedTime: 50, vocabularyCount: 35, completed: false, locked: userLevel !== 'advanced' },
          { id: '16', title: 'Poetry & Proverbs', description: 'Traditional wisdom and wordplay', difficulty: 'advanced', estimatedTime: 45, vocabularyCount: 30, completed: false, locked: userLevel !== 'advanced' },
        ]
      }
    ];

    setPaths(learningPaths);
    
    // Auto-select appropriate path for user level
    if (userLevel === 'beginner') setSelectedPath('beginner-fundamentals');
    else if (userLevel === 'intermediate') setSelectedPath('intermediate-conversation');
    else setSelectedPath('advanced-culture');
  };

  const startLesson = (lesson: Lesson) => {
    if (lesson.locked) return;
    
    console.log('Starting lesson:', lesson.title);
    // In a real app, navigate to lesson component or modal
    alert(`Starting "${lesson.title}" - This would open the lesson interface!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const selectedPathData = paths.find(p => p.id === selectedPath);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Guided Learning Paths</h1>
        <p className="text-muted-foreground">Structured courses to master Goji step by step</p>
      </div>

      {/* Path Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paths.map((path) => (
          <Card 
            key={path.id}
            className={`cursor-pointer transition-all ${
              selectedPath === path.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPath(path.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={getDifficultyColor(path.difficulty)}
                  >
                    {path.difficulty}
                  </Badge>
                </div>
                {path.difficulty === userLevel && (
                  <Star className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription>{path.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{path.completedLessons}/{path.totalLessons} lessons</span>
                  <span>{path.estimatedHours}h total</span>
                </div>
                <Progress 
                  value={(path.completedLessons / path.totalLessons) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Path Details */}
      {selectedPathData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedPathData.title}
                </CardTitle>
                <CardDescription>{selectedPathData.description}</CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className={getDifficultyColor(selectedPathData.difficulty)}
              >
                {selectedPathData.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progress: {selectedPathData.completedLessons}/{selectedPathData.totalLessons} lessons</span>
                <span>Estimated: {selectedPathData.estimatedHours} hours</span>
              </div>
              
              <Progress 
                value={(selectedPathData.completedLessons / selectedPathData.totalLessons) * 100} 
                className="h-3"
              />

              <div className="grid gap-3">
                {selectedPathData.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      lesson.locked ? 'opacity-50' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : lesson.locked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {lesson.vocabularyCount} words
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lesson.estimatedTime} minutes
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant={lesson.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => startLesson(lesson)}
                      disabled={lesson.locked}
                      className="flex-shrink-0"
                    >
                      {lesson.completed ? (
                        <>Review</>
                      ) : lesson.locked ? (
                        <>Locked</>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};