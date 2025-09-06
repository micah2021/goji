import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Volume2, Check, X, Trophy, Star } from "lucide-react";

interface LessonWord {
  id: string;
  goji: string;
  english: string;
  hausa?: string;
  pronunciation?: string;
  example?: string;
}

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: number;
    vocabularyCount: number;
    completed: boolean;
  } | null;
}

export const LessonModal = ({ isOpen, onClose, lesson }: LessonModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonWords, setLessonWords] = useState<LessonWord[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      generateLessonContent();
      setCurrentStep(0);
      setUserAnswers({});
      setShowResults(false);
      setScore(0);
    }
  }, [isOpen, lesson]);

  const generateLessonContent = () => {
    if (!lesson) return;

    // Generate lesson content based on lesson title
    const lessonContentMap: { [key: string]: LessonWord[] } = {
      'Basic Things': [
        { id: '1', goji: 'àɗò', english: 'eye', hausa: 'ido', pronunciation: 'à-ɗò', example: 'àɗò fari - white eye' },
        { id: '2', goji: 'àɗéewè', english: 'bird', hausa: 'tsuntsu', pronunciation: 'à-ɗéé-wè', example: 'àɗéewè ja - red bird' },
        { id: '3', goji: 'àlàw', english: 'leaf', hausa: 'ganye', pronunciation: 'à-làw', example: 'àlàw kore - green leaf' },
        { id: '4', goji: 'àládè', english: 'pig', hausa: 'alade', pronunciation: 'à-lá-dè', example: 'àládè babba - big pig' },
        { id: '5', goji: 'àlúurà', english: 'needle', hausa: 'allura', pronunciation: 'à-lúu-rà', example: 'àlúurà kaifi - sharp needle' },
        { id: '6', goji: 'àllágà', english: 'house rat', hausa: 'ɓera', pronunciation: 'àl-lá-gà', example: 'àllágà karami - small rat' },
        { id: '7', goji: 'rêw', english: 'python', hausa: 'mesa', pronunciation: 'rêw', example: 'rêw dogon - long python' },
        { id: '8', goji: 'àɗúnúnò', english: 'horn', hausa: 'ƙaho', pronunciation: 'à-ɗú-nú-nò', example: 'àɗúnúnò kaifi - sharp horn' }
      ],
      'Family Members': [
        { id: '1', goji: 'shuji', english: 'father', hausa: 'uba', pronunciation: 'SHU-ji', example: 'Shuji na - My father' },
        { id: '2', goji: 'poomun', english: 'wife/mother', hausa: 'mata/uwa', pronunciation: 'POO-mun', example: 'Poomun ta - His wife' },
        { id: '3', goji: 'lano', english: 'child', hausa: 'yaro/yarinya', pronunciation: 'LA-no', example: 'Lano nasu - Their child' },
        { id: '4', goji: 'memme', english: 'people/family', hausa: 'mutane/iyali', pronunciation: 'MEM-me', example: 'Memme mu - Our family' },
        { id: '5', goji: 'dada', english: 'older brother/sister', hausa: 'babban yaya', pronunciation: 'DA-da', example: 'Dada na - My older sibling' },
        { id: '6', goji: 'kaka', english: 'grandfather', hausa: 'kaka', pronunciation: 'KA-ka', example: 'Kaka mu - Our grandfather' },
        { id: '7', goji: 'mama', english: 'grandmother', hausa: 'kaka', pronunciation: 'MA-ma', example: 'Mama ta - Her grandmother' },
        { id: '8', goji: 'kanwa', english: 'younger sibling', hausa: 'kanwa', pronunciation: 'KAN-wa', example: 'Kanwa na - My younger sibling' },
        { id: '9', goji: 'baba', english: 'uncle/elder', hausa: 'kawu/babba', pronunciation: 'BA-ba', example: 'Baba Musa - Uncle Musa' },
        { id: '10', goji: 'yaya', english: 'aunt/elder sister', hausa: 'yaya', pronunciation: 'YA-ya', example: 'Yaya Kande - Aunt Kande' }
      ],
      'Numbers 1-20': [
        { id: '1', goji: 'ɗoƙ', english: 'one', hausa: 'ɗaya', pronunciation: 'DOHK', example: 'Wi ɗoƙ - One goat' },
        { id: '2', goji: 'palou', english: 'two', hausa: 'biyu', pronunciation: 'pa-LOU', example: 'Fe palou - Two chickens' },
        { id: '3', goji: 'tat', english: 'three', hausa: 'uku', pronunciation: 'TAT', example: 'Telan tat - Three pots' },
        { id: '4', goji: 'pereu', english: 'four', hausa: 'huɗu', pronunciation: 'pe-REU', example: 'Lano pereu - Four children' },
        { id: '5', goji: 'fuwat', english: 'five', hausa: 'biyar', pronunciation: 'fu-WAT', example: 'Biro fuwat - Five trees' },
        { id: '6', goji: 'susuu', english: 'six', hausa: 'shida', pronunciation: 'su-SUU', example: 'Gburam susuu - Six chairs' },
        { id: '7', goji: 'toolu', english: 'seven', hausa: 'bakwai', pronunciation: 'TOO-lu', example: 'Mina toolu - Seven houses' },
        { id: '8', goji: 'takanduu', english: 'eight', hausa: 'takwas', pronunciation: 'ta-kan-DUU', example: 'Shela takanduu - Eight stones' },
        { id: '9', goji: 'tandu', english: 'nine', hausa: 'tara', pronunciation: 'TAN-du', example: 'Ɗo tandu - Nine waters' },
        { id: '10', goji: 'kpomu', english: 'ten', hausa: 'goma', pronunciation: 'KPO-mu', example: 'Memme kpomu - Ten people' }
      ],
      'Common Objects': [
        { id: '1', goji: 'mina', english: 'house', hausa: 'gida', pronunciation: 'MI-na', example: 'Mina babba - Big house' },
        { id: '2', goji: 'telan', english: 'pot', hausa: 'tukunya', pronunciation: 'te-LAN', example: 'Telan ja - Red pot' },
        { id: '3', goji: 'gburam', english: 'chair', hausa: 'kujera', pronunciation: 'gbu-RAM', example: 'Gburam sabon - New chair' },
        { id: '4', goji: 'dummo̱', english: 'hoe', hausa: 'fartanya', pronunciation: 'dum-MOH', example: 'Dummo̱ mai kaifi - Sharp hoe' },
        { id: '5', goji: 'komi', english: 'bowl', hausa: 'kwano', pronunciation: 'ko-MI', example: 'Komi ɗin wechina - Food bowl' },
        { id: '6', goji: 'jombi', english: 'rope', hausa: 'igiya', pronunciation: 'jom-BI', example: 'Jombi dogon - Long rope' },
        { id: '7', goji: 'kaɓon', english: 'calabash', hausa: 'kwarya', pronunciation: 'ka-BOHN', example: 'Kaɓon ruwa - Water calabash' },
        { id: '8', goji: 'tebur', english: 'table', hausa: 'tebur', pronunciation: 'te-BUR', example: 'Tebur fari - White table' }
      ]
    };

    const content = lessonContentMap[lesson.title] || lessonContentMap['Basic Things'];
    setLessonWords(content.slice(0, lesson.vocabularyCount || 8));
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; // Approximate for Goji
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (wordId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [wordId]: answer
    }));
  };

  const checkAnswers = () => {
    const correct = lessonWords.filter(word => 
      userAnswers[word.id]?.toLowerCase().trim() === word.english.toLowerCase().trim()
    ).length;
    
    setScore(correct);
    setShowResults(true);
  };

  const completeLesson = async () => {
    if (!user || !lesson) return;
    
    setLoading(true);
    try {
      const percentage = (score / lessonWords.length) * 100;
      const xpEarned = Math.floor(percentage * 0.5); // Up to 50 XP per lesson
      
      // Update vocabulary mastery for each word practiced
      for (const word of lessonWords) {
        const wasCorrect = userAnswers[word.id]?.toLowerCase().trim() === word.english.toLowerCase().trim();
        
        // In a real app, you'd update the vocabulary_mastery table
        // For now, we'll just track in conversation analytics
      }
      
      // Log completion in conversation analytics
      await supabase
        .from('conversation_analytics')
        .insert({
          conversation_id: crypto.randomUUID(),
          user_id: user.id,
          session_duration_minutes: lesson.estimatedTime,
          vocabulary_used: lessonWords.map(w => w.goji),
          new_words_encountered: lessonWords.map(w => w.goji),
          engagement_score: percentage / 100,
          learning_objectives_met: [lesson.title],
          cultural_topics_discussed: [],
          session_summary: `Completed lesson: ${lesson.title} with ${score}/${lessonWords.length} correct answers`,
          ai_feedback: {
            lesson_completed: true,
            score: percentage,
            xp_earned: xpEarned
          }
        });

      toast({
        title: "Lesson Completed! 🎉",
        description: `You scored ${score}/${lessonWords.length} and earned ${xpEarned} XP!`,
      });

      onClose();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLessonStep = () => {
    if (showResults) {
      const percentage = Math.round((score / lessonWords.length) * 100);
      const isPassed = percentage >= 70;
      
      return (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {isPassed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <Star className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className={`text-2xl ${isPassed ? 'text-green-600' : 'text-blue-600'}`}>
              {isPassed ? 'Excellent Work!' : 'Good Effort!'}
            </CardTitle>
            <CardDescription>
              You scored {score} out of {lessonWords.length} correct ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={percentage} className="h-3" />
            
            <div className="space-y-2">
              {lessonWords.map((word) => {
                const userAnswer = userAnswers[word.id]?.toLowerCase().trim();
                const correctAnswer = word.english.toLowerCase().trim();
                const isCorrect = userAnswer === correctAnswer;
                
                return (
                  <div key={word.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{word.goji}</span>
                    </div>
                    <div className="text-right">
                      <div className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        Your answer: {userAnswers[word.id] || 'No answer'}
                      </div>
                      {!isCorrect && (
                        <div className="text-sm text-muted-foreground">
                          Correct: {word.english}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowResults(false)} className="flex-1">
                Try Again
              </Button>
              <Button 
                onClick={completeLesson} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : `Complete Lesson (+${Math.floor(percentage * 0.5)} XP)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentStep < lessonWords.length) {
      // Learning phase - show vocabulary
      const word = lessonWords[currentStep];
      
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{currentStep + 1} of {lessonWords.length}</Badge>
              <Badge variant="secondary">{lesson?.difficulty}</Badge>
            </div>
            <Progress value={((currentStep + 1) / lessonWords.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-3xl font-bold text-primary">{word.goji}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(word.goji)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                {word.pronunciation && (
                  <p className="text-sm text-muted-foreground">/{word.pronunciation}/</p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl">{word.english}</p>
                {word.hausa && (
                  <p className="text-lg text-muted-foreground">Hausa: {word.hausa}</p>
                )}
              </div>
              
              {word.example && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Example:</p>
                  <p className="text-sm">{word.example}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                Next Word
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // Quiz phase
      return (
        <Card>
          <CardHeader>
            <CardTitle>Quick Quiz</CardTitle>
            <CardDescription>
              Test your knowledge of the words you just learned
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessonWords.map((word, index) => (
              <div key={word.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}. {word.goji}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(word.goji)}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="English translation..."
                  className="w-full p-2 border rounded"
                  value={userAnswers[word.id] || ''}
                  onChange={(e) => handleAnswer(word.id, e.target.value)}
                />
              </div>
            ))}
            
            <Button 
              onClick={checkAnswers} 
              className="w-full mt-6"
              disabled={Object.keys(userAnswers).length < lessonWords.length}
            >
              Check Answers
            </Button>
          </CardContent>
        </Card>
      );
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lesson.completed && <Check className="h-5 w-5 text-green-500" />}
            {lesson.title}
          </DialogTitle>
          <DialogDescription>
            {lesson.description} • {lesson.estimatedTime} minutes • {lesson.vocabularyCount} words
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {renderLessonStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};