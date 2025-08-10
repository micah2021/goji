import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";

const TutorPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm your Goji language tutor. Ask me about words, phrases, or culture!",
      contentHa: "Sannu! Ni malamin harshen Goji ne. Ka tambaye ni game da kalmomi, jimloli, ko al'ada!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      contentHa: undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: "Thank you for your question! I'm still learning to help with Goji language queries.",
        contentHa: "Na gode da tambayar ku! Har yanzu ina koyon taimakawa da tambayoyin harshen Goji."
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">AI Tutor</h1>
        <p className="text-sm text-muted-foreground">
          Learn Goji with AI assistance • Koyi Goji da taimakon AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] p-3 ${
              message.type === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}>
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  {message.type === "bot" ? (
                    <Bot className="h-4 w-4 mt-1" />
                  ) : (
                    <User className="h-4 w-4 mt-1" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm">{message.content}</p>
                  {message.contentHa && (
                    <p className="text-xs opacity-80">{message.contentHa}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask about Goji language... / Tambaya game da harshen Goji..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;