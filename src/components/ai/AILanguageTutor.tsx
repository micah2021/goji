import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Mic, BookOpen, Volume2, Lightbulb } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AILanguageTutor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Sannu! I\'m your AI Goji language tutor. How can I help you learn today? You can:\n\n🗣️ Practice conversations\n📚 Learn new vocabulary\n🎯 Work on pronunciation\n📖 Explore Goji culture\n\nJust ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'chat' | 'vocabulary' | 'grammar' | 'culture'>('chat');
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add context based on current mode
      let contextPrompt = inputMessage;
      if (currentMode === 'vocabulary') {
        contextPrompt += ' (Focus on Goji vocabulary and word meanings)';
      } else if (currentMode === 'grammar') {
        contextPrompt += ' (Focus on Goji grammar rules and sentence structure)';
      } else if (currentMode === 'culture') {
        contextPrompt += ' (Focus on Goji culture, traditions, and stories)';
      }

      const { data, error } = await supabase.functions.invoke('ai-language-tutor', {
        body: {
          userInput: contextPrompt,
          conversationHistory,
          lesson_context: `Goji language learning - ${currentMode} mode`
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error communicating with tutor",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    { text: "Teach me basic greetings", mode: 'vocabulary' as const },
    { text: "How do I make words plural?", mode: 'grammar' as const },
    { text: "Tell me about Goji traditions", mode: 'culture' as const },
    { text: "Practice counting in Goji", mode: 'vocabulary' as const }
  ];

  const handleQuickPrompt = (prompt: string, mode: typeof currentMode) => {
    setCurrentMode(mode);
    setInputMessage(prompt);
  };

  return (
    <div className="space-y-4">
      {/* Learning Mode Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={currentMode === 'chat' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentMode('chat')}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Button>
        <Button
          variant={currentMode === 'vocabulary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentMode('vocabulary')}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Vocabulary
        </Button>
        <Button
          variant={currentMode === 'grammar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentMode('grammar')}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Grammar
        </Button>
        <Button
          variant={currentMode === 'culture' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentMode('culture')}
          className="flex items-center gap-2"
        >
          <Volume2 className="h-4 w-4" />
          Culture
        </Button>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickPrompts.map((prompt, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => handleQuickPrompt(prompt.text, prompt.mode)}
          >
            {prompt.text}
          </Badge>
        ))}
      </div>

      <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Goji Language Tutor
            <Badge variant="outline" className="ml-auto">
              {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
            </Badge>
          </CardTitle>
          <CardDescription>
            Practice Goji with your personal AI tutor • Koyi Goji tare da koyar da ku na AI
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-sm">Tutor is typing...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message in Goji or English..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};