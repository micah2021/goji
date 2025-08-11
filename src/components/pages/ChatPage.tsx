import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Send, Trash2, Brain, BarChart3, Menu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ConversationManager from "@/components/chat/ConversationManager";
import EnhancedAudioRecorder from "@/components/chat/EnhancedAudioRecorder";

interface Message {
  id: string;
  user_id: string;
  text: string;
  audio_url?: string;
  tags?: string;
  conversation_id?: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    role: string;
  };
}

interface AILearningData {
  id: string;
  data_type: string;
  content: string;
  quality_score: number;
  is_verified: boolean;
  learning_category: string;
  difficulty_level: string;
}

const ChatPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [aiLearningData, setAiLearningData] = useState<AILearningData[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchDefaultConversation();
      fetchAILearningData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversationId]);

  const fetchDefaultConversation = async () => {
    try {
      // Get or create a default "General Chat" conversation
      let { data, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("title", "General Chat")
        .eq("conversation_type", "general")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data && user) {
        // Create default conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            title: "General Chat",
            description: "Main conversation for Goji language enthusiasts",
            creator_id: user.id,
            conversation_type: "general"
          })
          .select()
          .single();

        if (createError) throw createError;
        data = newConv;
      }

      if (data) {
        setSelectedConversationId(data.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load default conversation",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversationId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            role
          )
        `)
        .eq("conversation_id", selectedConversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const fetchAILearningData = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_learning_data")
        .select("*")
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAiLearningData(data || []);
    } catch (error) {
      console.error("Failed to fetch AI learning data:", error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConversationId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          text: newMessage.trim(),
          tags: "general",
          conversation_id: selectedConversationId
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Success",
        description: "Message deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to access chat</p>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="h-full p-4">
      <ConversationManager 
        onSelectConversation={(id) => {
          setSelectedConversationId(id);
          if (isMobile) setSidebarOpen(false);
        }}
        selectedConversationId={selectedConversationId}
      />
      
      {/* AI Learning Insights */}
      <div className="mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAIInsights(!showAIInsights)}
          className="w-full justify-start"
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Learning Insights
        </Button>
        
        {showAIInsights && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground">
              Verified learning data: {aiLearningData.length} entries
            </div>
            {aiLearningData.slice(0, 3).map((data) => (
              <Card key={data.id} className="p-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="text-xs">
                      {data.learning_category}
                    </Badge>
                    <span className="text-muted-foreground">
                      {Math.round(data.quality_score * 100)}%
                    </span>
                  </div>
                  <p className="line-clamp-2">{data.content}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-80 border-r bg-card/50">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 bg-card/50">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversationId ? (
          <>
            <div className="p-4 border-b bg-card">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Goji Language Chat
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">
                    Practice with native speakers • AI-powered learning
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea ref={scrollAreaRef} className={`flex-1 ${isMobile ? 'px-2 py-4' : 'p-4'}`}>
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {messages.map((message) => (
                  <Card key={message.id} className={`${isMobile ? 'p-2' : 'p-3'}`}>
                    <div className="flex items-start gap-2">
                      <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} flex-shrink-0`}>
                        <AvatarFallback className={isMobile ? 'text-xs' : ''}>
                          {message.profiles?.username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-1 mb-1 ${isMobile ? 'flex-wrap' : ''}`}>
                          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                            {message.profiles?.full_name || message.profiles?.username || "Anonymous"}
                          </span>
                          {message.profiles?.role === "admin" && (
                            <Badge variant="secondary" className="text-xs">Admin</Badge>
                          )}
                          <span className={`text-xs text-muted-foreground ${isMobile ? 'w-full' : ''}`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} break-words`}>{message.text}</p>
                        
                        {message.audio_url && (
                          <div className="mt-2">
                            <audio controls className={`w-full ${isMobile ? 'max-w-full' : 'max-w-xs'}`}>
                              <source src={message.audio_url} type="audio/webm" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        
                        {message.tags && (
                          <Badge variant="outline" className="text-xs mt-2">
                            {message.tags}
                          </Badge>
                        )}
                      </div>
                      
                      {user.id === message.user_id && (
                        <Button
                          variant="ghost"
                          size={isMobile ? "sm" : "sm"}
                          onClick={() => deleteMessage(message.id)}
                          className="text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className={`${isMobile ? 'p-2' : 'p-4'} border-t bg-card`}>
              <form onSubmit={sendMessage} className={`flex gap-${isMobile ? '1' : '2'}`}>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isMobile ? "Message..." : "Type your message in Goji or English..."}
                  disabled={isLoading}
                  className={`flex-1 ${isMobile ? 'text-sm h-9' : ''}`}
                />
                <EnhancedAudioRecorder
                  conversationId={selectedConversationId}
                  onAudioUploaded={() => {}}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !newMessage.trim()}
                  size={isMobile ? "sm" : "default"}
                >
                  <Send className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </Button>
              </form>
              {!isMobile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Your conversations help train AI to better understand Goji language
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Select a Conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;