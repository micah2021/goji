import { Mail, Phone, Heart, BookOpen, Users, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import gojiLogo from "@/assets/goji-logo.png";

const AboutPage = () => {
  const { toast } = useToast();

  const handleContact = (type: string) => {
    if (type === "email") {
      window.open("mailto:micahmunang@gmail.com", "_blank");
    } else if (type === "phone") {
      window.open("tel:+2348159560437", "_blank");
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto">
          <img src={gojiLogo} alt="Goji Language Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-goji-earth">Fo Goji</h1>
          <p className="text-lg text-goji-warm font-medium">The Voice of Our People</p>
          <p className="text-sm text-muted-foreground mt-2">
            Muryar Mutanenmu • Preserving the Goji language for future generations
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <Card className="p-6 bg-gradient-to-br from-goji-accent/10 to-goji-warm/10">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-goji-warm" />
            <h2 className="text-lg font-semibold text-goji-earth">Our Mission</h2>
          </div>
          <p className="text-foreground leading-relaxed">
            This app uses the 2006 Goji writing system created by the dedicated Goji Group in Bauchi. 
            Our goal is to preserve and celebrate the beautiful Goji language, ensuring it continues 
            to thrive for generations to come.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Wannan app yana amfani da tsarin rubutu na Goji na 2006 wanda Ƙungiyar Goji ta Bauchi ta ƙirƙira. 
            Burinmu shine mu kiyaye kuma mu yabi kyakkyawan harshen Goji.
          </p>
        </div>
      </Card>

      {/* About the Creator */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-goji-warm" />
            <h2 className="text-lg font-semibold text-goji-earth">Created with Love</h2>
          </div>
          <div className="space-y-3">
            <p className="text-foreground">
              <span className="font-semibold text-goji-warm">Developed by Micah Munang</span> from Kushi, 
              a proud member of the Goji community who believes in the power of technology to preserve 
              our cultural heritage.
            </p>
            <p className="text-sm text-muted-foreground">
              This app belongs to the people of Kushi and all who speak Goji. 
              It begins with one word: <span className="font-bold text-goji-warm">Fo Goji</span> (Speak Goji).
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-goji-warm" />
            <h2 className="text-lg font-semibold text-goji-earth">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">💬</div>
              <div>
                <p className="font-medium text-foreground">Community Chat</p>
                <p className="text-xs text-muted-foreground">Practice with learners and native speakers worldwide</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">🤖</div>
              <div>
                <p className="font-medium text-foreground">AI Language Tutor</p>
                <p className="text-xs text-muted-foreground">Personalized conversations with AI feedback</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">📚</div>
              <div>
                <p className="font-medium text-foreground">Interactive Dictionary</p>
                <p className="text-xs text-muted-foreground">Searchable vocabulary with translations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">🎓</div>
              <div>
                <p className="font-medium text-foreground">Cultural Lessons</p>
                <p className="text-xs text-muted-foreground">Traditional stories in Goji language</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">🔤</div>
              <div>
                <p className="font-medium text-foreground">Phonology Guide</p>
                <p className="text-xs text-muted-foreground">Learn Goji sounds and pronunciation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-goji-accent/10 rounded-lg">
              <div className="w-8 h-8 bg-goji-warm text-white rounded-full flex items-center justify-center text-sm">🎤</div>
              <div>
                <p className="font-medium text-foreground">Audio Recordings</p>
                <p className="text-xs text-muted-foreground">Record and share cultural stories</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Future Vision */}
      <Card className="p-6 bg-gradient-to-br from-goji-nature/10 to-goji-earth/10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-goji-earth">Future Vision</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center space-x-2">
              <span className="text-goji-warm">🌱</span>
              <span>Add vocabulary learning with spaced repetition</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-goji-warm">📈</span>
              <span>Progress tracking for learning achievements</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-goji-warm">📜</span>
              <span>More traditional stories and proverbs</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-goji-warm">🏫</span>
              <span>Educational resources for schools</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="text-goji-warm">🤝</span>
              <span>Community features for language exchange</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Acknowledgment */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-goji-earth">Acknowledgment</h2>
          <p className="text-sm text-foreground leading-relaxed">
            This app is built using the 2006 Goji writing system documentation as a reference. 
            We acknowledge and respect the original work of the Goji Group and aim to honor 
            their efforts in preserving the language through modern technology.
          </p>
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-goji-earth">Get in Touch</h2>
          <p className="text-sm text-muted-foreground">
            Have suggestions, questions, or want to contribute? We'd love to hear from you!
          </p>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              onClick={() => handleContact("email")}
              className="flex items-center space-x-2 border-goji-warm text-goji-warm hover:bg-goji-warm hover:text-white"
            >
              <Mail className="h-4 w-4" />
              <span>Contact via Email</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleContact("phone")}
              className="flex items-center space-x-2 border-goji-earth text-goji-earth hover:bg-goji-earth hover:text-white"
            >
              <Phone className="h-4 w-4" />
              <span>Call +234 815 956 0437</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Made with ❤️ for the Goji people
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © 2025 Goji Keeper • Preserving our heritage, one word at a time
        </p>
      </div>
    </div>
  );
};

export default AboutPage;