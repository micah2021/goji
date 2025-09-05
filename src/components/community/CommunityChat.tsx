import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Info } from "lucide-react";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Message {
  id: string;
  text: string;
  user_id: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  };
}

interface CommunityConversation {
  id: string;
  title: string;
  description: string;
}

export const CommunityChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<CommunityConversation | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchCommunityConversation = async () => {
      try {
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('id, title, description')
          .eq('title', 'Goji Community Chat')
          .single();

        if (convError) {
          throw convError;
        }

        setConversation(conv);

        // Fetch existing messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            text,
            user_id,
            created_at,
            profiles!inner(display_name)
          `)
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) {
          throw messagesError;
        }

        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error fetching community chat:', error);
        toast({
          title: "Error loading community chat",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityConversation();
  }, [user, toast]);

  useEffect(() => {
    if (!conversation || !user) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('community-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload: RealtimePostgresChangesPayload<any>) => {
        console.log('New message received:', payload);
        
        // Fetch the complete message with profile data
        const fetchCompleteMessage = async () => {
          const { data, error } = await supabase
            .from('messages')
            .select(`
              id,
              text,
              user_id,
              created_at,
              profiles!inner(display_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages(prev => [...prev, data]);
          }
        };

        fetchCompleteMessage();
      })
      .subscribe();

    // Track online presence
    const presenceChannel = supabase
      .channel('community-presence')
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users = Object.keys(newState).length;
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversation, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || !user || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          text: newMessage.trim(),
        });

      if (error) {
        throw error;
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading community chat...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {conversation?.title || "Community Chat"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {conversation?.description}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {onlineUsers} online
          </Badge>
        </div>
        
        <Alert className="mt-3">
          <Info className="h-4 w-4" />
          <AlertDescription className="font-medium">
            🗣️ Goji language only advised! This is a space to practice Goji with the community.
            <br />
            <span className="text-sm opacity-90">Goji kɔ́lɔ́ɣɔ́ pén! Nìŋò mè kù yù Goji shíràw tèerè.</span>
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.user_id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.profiles?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col max-w-[70%] ${
                    message.user_id === user?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {message.profiles?.display_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.user_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message in Goji... (Goji kɔ́lɔ́ɣɔ́ yù...)"
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};