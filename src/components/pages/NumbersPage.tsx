import { useState } from "react";
import { Volume2, Play, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface NumberData {
  goji: string;
  english: string;
  hausa: string;
  number: number;
  example?: string;
}

const NumbersPage = () => {
  const [currentQuiz, setCurrentQuiz] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const { toast } = useToast();

  const numbers: NumberData[] = [
    // Basic numbers 1-10
    { goji: "ɗo̱ƙ", english: "one", hausa: "ɗaya", number: 1 },
    { goji: "palou", english: "two", hausa: "biyu", number: 2 },
    { goji: "tat", english: "three", hausa: "uku", number: 3 },
    { goji: "pereu", english: "four", hausa: "huɗu", number: 4 },
    { goji: "fuwat", english: "five", hausa: "biyar", number: 5 },
    { goji: "paragbana", english: "six", hausa: "shida", number: 6 },
    { goji: "parlau", english: "seven", hausa: "bakwai", number: 7 },
    { goji: "piɗidou", english: "eight", hausa: "takwas", number: 8 },
    { goji: "fejereu", english: "nine", hausa: "tara", number: 9 },
    { goji: "kpomo", english: "ten", hausa: "goma", number: 10 },
    
    // 11-19
    { goji: "ge ɗo̱ƙ", english: "eleven", hausa: "sha ɗaya", number: 11 },
    { goji: "ge palou", english: "twelve", hausa: "sha biyu", number: 12 },
    { goji: "ge tat", english: "thirteen", hausa: "sha uku", number: 13 },
    { goji: "ge pereu", english: "fourteen", hausa: "sha huɗu", number: 14 },
    { goji: "ge fuwat", english: "fifteen", hausa: "sha biyar", number: 15 },
    { goji: "ge paragbana", english: "sixteen", hausa: "sha shida", number: 16 },
    { goji: "ge parlau", english: "seventeen", hausa: "sha bakwai", number: 17 },
    { goji: "ge piɗidou", english: "eighteen", hausa: "sha takwas", number: 18 },
    { goji: "ge fejereu", english: "nineteen", hausa: "sha tara", number: 19 },
    
    // 20s
    { goji: "nopalou", english: "twenty", hausa: "ashirin", number: 20 },
    { goji: "nopalou ɗo̱ƙ", english: "twenty one", hausa: "ashirin ɗa ɗaya", number: 21 },
    { goji: "nopalou tat", english: "twenty three", hausa: "ashirin ɗa uku", number: 23 },
    { goji: "nopalou pereu", english: "twenty four", hausa: "ashirin ɗa huɗu", number: 24 },
    { goji: "nopalou fuwat", english: "twenty five", hausa: "ashirin ɗa biyar", number: 25 },
    { goji: "nopalou paragbana", english: "twenty six", hausa: "ashirin ɗa shida", number: 26 },
    { goji: "nopalou parlau", english: "twenty seven", hausa: "ashirin ɗa bakwai", number: 27 },
    { goji: "nopalou piɗidou", english: "twenty eight", hausa: "ashirin ɗa takwas", number: 28 },
    { goji: "nopalou fejereu", english: "twenty nine", hausa: "ashirin ɗa tara", number: 29 },
    
    // Tens
    { goji: "notat", english: "thirty", hausa: "talatin", number: 30 },
    { goji: "nopereu", english: "forty", hausa: "arbain", number: 40 },
    { goji: "nofuwat", english: "fifty", hausa: "amsin", number: 50 },
    { goji: "noparagbana", english: "sixty", hausa: "sittin", number: 60 },
    { goji: "noparlau", english: "seventy", hausa: "sabain", number: 70 },
    { goji: "nopiɗidou", english: "eighty", hausa: "tamanin", number: 80 },
    { goji: "nofejereu", english: "ninety", hausa: "tasain", number: 90 },
    
    // Hundreds
    { goji: "shigɗo̱ƙ", english: "one hundred", hausa: "ɗari", number: 100 },
    { goji: "shigpalou", english: "two hundred", hausa: "ɗari biyu", number: 200 },
    { goji: "shigtat", english: "three hundred", hausa: "ɗari uku", number: 300 },
    { goji: "shigpereu", english: "four hundred", hausa: "ɗari huɗu", number: 400 },
    { goji: "shigfuwat", english: "five hundred", hausa: "ɗari biyar", number: 500 },
    { goji: "shigparagbana", english: "six hundred", hausa: "ɗari shida", number: 600 },
    { goji: "shigparlau", english: "seven hundred", hausa: "ɗari bakwai", number: 700 },
    { goji: "shigpiɗidou", english: "eight hundred", hausa: "ɗari takwas", number: 800 },
    { goji: "shigfejereu", english: "nine hundred", hausa: "ɗari tara", number: 900 },
    
    // Thousand
    { goji: "ɗupɗo̱ƙ", english: "one thousand", hausa: "dubu", number: 1000 },
  ];

  const startQuiz = () => {
    const randomIndex = Math.floor(Math.random() * 10); // Only quiz 1-10
    setCurrentQuiz(randomIndex);
    setSelectedAnswer(null);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null || currentQuiz === null) return;
    
    const isCorrect = selectedAnswer === numbers[currentQuiz].number;
    if (isCorrect) {
      setScore(score + 1);
      toast({ title: "Correct! / Daidai!", description: `${numbers[currentQuiz].goji} is ${numbers[currentQuiz].english}` });
    } else {
      toast({ 
        title: "Try again / Sake gwadawa", 
        description: `${numbers[currentQuiz].goji} means ${numbers[currentQuiz].english}`,
        variant: "destructive"
      });
    }
    
    setQuestionsAnswered(questionsAnswered + 1);
    setTimeout(() => {
      setCurrentQuiz(null);
      setSelectedAnswer(null);
    }, 2000);
  };

  const playAudio = (word: string) => {
    toast({ title: "Audio coming soon", description: `"${word}" pronunciation will be available soon` });
  };

  const getQuizOptions = () => {
    if (currentQuiz === null) return [];
    const correctAnswer = numbers[currentQuiz].number;
    const options = [correctAnswer];
    
    while (options.length < 3) {
      const randomNum = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(randomNum)) {
        options.push(randomNum);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Goji Numbers</h1>
        <p className="text-sm text-muted-foreground">
          Lambobori na Goji • Learn counting in Goji
        </p>
      </div>

      {/* Quiz Section */}
      {currentQuiz === null ? (
        <div className="bg-gradient-to-r from-goji-warm/20 to-goji-accent/20 rounded-lg p-6 text-center space-y-4">
          <h3 className="text-lg font-semibold text-goji-earth">Number Quiz</h3>
          <p className="text-sm text-muted-foreground">
            Test your knowledge! • Gwada ilimin ku!
          </p>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-goji-warm">{score}/{questionsAnswered}</p>
            <p className="text-xs text-muted-foreground">Correct answers</p>
          </div>
          <Button onClick={startQuiz} className="bg-goji-warm hover:bg-goji-earth">
            <Play className="h-4 w-4 mr-2" />
            Start Quiz • Fara Tambaya
          </Button>
        </div>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-goji-accent/10 to-goji-warm/10">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-goji-earth">Which number is this?</h3>
            <div className="text-3xl font-bold text-goji-warm">{numbers[currentQuiz].goji}</div>
            <p className="text-sm text-muted-foreground">
              Wanne lamba ne wannan? • Which number is this?
            </p>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              {getQuizOptions().map((option) => (
                <Button
                  key={option}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  onClick={() => setSelectedAnswer(option)}
                  className="text-lg h-12"
                >
                  {option}
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={checkAnswer} 
              disabled={selectedAnswer === null}
              className="w-full bg-goji-nature hover:bg-goji-earth"
            >
              Check Answer • Duba Amsa
            </Button>
          </div>
        </Card>
      )}

      {/* Numbers List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-goji-earth">Numbers 1-10 • Lambobori 1-10</h2>
        {numbers.slice(0, 10).map((num, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center font-bold">
                    {num.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-goji-earth">{num.goji}</h3>
                    <p className="text-sm text-muted-foreground">
                      {num.english} • {num.hausa}
                    </p>
                    {num.example && (
                      <p className="text-xs text-goji-warm italic mt-1">
                        {num.example}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => playAudio(num.goji)}
                className="border-goji-warm text-goji-warm hover:bg-goji-warm hover:text-white"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Large Numbers */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-goji-earth">Large Numbers • Manyan Lambobori</h2>
        {numbers.slice(10).map((num, index) => (
          <Card key={index + 10} className="p-4 bg-gradient-to-r from-goji-nature/10 to-goji-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-goji-earth">{num.goji}</h3>
                <p className="text-sm text-muted-foreground">
                  {num.english} ({num.number.toLocaleString()}) • {num.hausa}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => playAudio(num.goji)}
                className="border-goji-warm text-goji-warm hover:bg-goji-warm hover:text-white"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-secondary/30 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Practice daily to master Goji numbers! • Yi horo kowace rana don koyan lambobori na Goji!
        </p>
      </div>
    </div>
  );
};

export default NumbersPage;