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
import { Send, Trash2, Brain, Menu, ImageIcon, Volume2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import ImageUploadDialog from "@/components/ui/image-upload-dialog";

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
  const [communityConversationId, setCommunityConversationId] = useState<string | undefined>();
  const [aiLearningData, setAiLearningData] = useState<AILearningData[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchCommunityConversation();
      fetchAILearningData();
    }
  }, [user]);

  useEffect(() => {
    if (communityConversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [communityConversationId]);

  const fetchCommunityConversation = async () => {
    console.log('Fetching community conversation for user:', user?.id);
    
    try {
      // Get or create the community chat conversation
      let { data, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("title", "Goji Community Chat")
        .eq("conversation_type", "general")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching community conversation:', error);
        throw error;
      }

      if (!data && user) {
        console.log('Creating community conversation');
        // Create community conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            title: "Goji Community Chat",
            description: "Community chat for all Goji language learners and speakers",
            creator_id: user.id,
            conversation_type: "general",
            difficulty_level: "beginner",
            is_active: true,
            message_count: 0,
            participant_count: 1
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating community conversation:', createError);
          throw createError;
        }
        data = newConv;
      }

      if (data) {
        console.log('Setting community conversation:', data.id);
        setCommunityConversationId(data.id);
      } else {
        console.log('No conversation found or created');
      }
    } catch (error) {
      console.error('Failed to load community conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load community chat. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    if (!communityConversationId) return;

    console.log('Fetching messages for conversation:', communityConversationId);
    
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
        .eq("conversation_id", communityConversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
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
    if (!communityConversationId) return;

    console.log('Setting up message subscription for conversation:', communityConversationId);

    const channel = supabase
      .channel(`messages-${communityConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${communityConversationId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          // Avoid fetching profile if it's the current user
          if (newMessage.user_id === user?.id) {
            const messageWithProfile = {
              ...newMessage,
              profiles: {
                username: user.user_metadata?.username || '',
                full_name: user.user_metadata?.full_name || '',
                role: user.user_metadata?.role || 'member'
              }
            };
            setMessages(prev => [...prev, messageWithProfile]);
            scrollToBottom();
            return;
          }
          
          // Fetch profile data for other users
          try {
            const { data: profileData, error } = await supabase
              .from("profiles")
              .select("username, full_name, role")
              .eq("user_id", newMessage.user_id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching profile:', error);
            }
            
            const messageWithProfile = {
              ...newMessage,
              profiles: profileData || { username: '', full_name: '', role: 'member' }
            };
            
            setMessages(prev => [...prev, messageWithProfile]);
            scrollToBottom();
          } catch (error) {
            console.error('Failed to fetch message profile:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message subscription');
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
    if (!newMessage.trim() || !user || !communityConversationId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          text: newMessage.trim(),
          tags: "general",
          conversation_id: communityConversationId
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

  const sendImageMessage = async (imageUrl: string, caption?: string) => {
    if (!user || !communityConversationId) return;

    try {
      const messageText = caption || "[Image]";
      const { error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          text: messageText,
          audio_url: imageUrl, // Reusing audio_url field for media
          tags: "general",
          conversation_id: communityConversationId
        });

      if (error) throw error;
      toast({
        title: "Success",
        description: "Image shared in chat!"
      });
    } catch (error) {
      console.error('Error sending image:', error);
      toast({
        title: "Error",
        description: "Failed to send image",
        variant: "destructive"
      });
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
      {/* Community Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Goji Community</h2>
        <Card className="p-3">
          <div className="text-center space-y-2">
            <div className="text-2xl">🌍</div>
            <p className="text-sm font-medium">Community Chat</p>
            <p className="text-xs text-muted-foreground">
              Practice Goji with learners and native speakers from around the world
            </p>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages today
            </Badge>
          </div>
        </Card>
      </div>
      
      {/* AI Learning Insights */}
      <div>
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
        {communityConversationId ? (
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
                  <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} flex items-center gap-2`}>
                    🌍 Goji Community Chat
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">
                    Community chat for Goji language learners worldwide
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
                            {message.audio_url.includes('images/') ? (
                              <div className="max-w-xs">
                                <img 
                                  src={message.audio_url} 
                                  alt="Shared image" 
                                  className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(message.audio_url, '_blank')}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <audio controls className={`w-full ${isMobile ? 'max-w-full' : 'max-w-xs'}`}>
                                  <source src={message.audio_url} type="audio/webm" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}
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
                <ImageUploadDialog
                  onUploadComplete={sendImageMessage}
                  triggerButton={
                    <Button variant="outline" size={isMobile ? "sm" : "default"} type="button">
                      <ImageIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </Button>
                  }
                  maxSizeMB={5}
                />
                <VoiceRecorder
                  conversationId={communityConversationId}
                  onAudioSent={() => {}}
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
                  Welcome to the Goji community! Share your learning journey and connect with others.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-4xl">🌍</div>
              <div>
                <h2 className="text-lg font-semibold">Loading Community Chat</h2>
                <p className="text-sm text-muted-foreground">
                  Connecting you to the Goji language community...
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