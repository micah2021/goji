import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  conversation_type: string;
  difficulty_level: string;
  message_count: number;
  participant_count: number;
  is_active: boolean;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

interface ConversationManagerProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationManager = ({ onSelectConversation, selectedConversationId }: ConversationManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          description,
          creator_id,
          conversation_type,
          difficulty_level,
          message_count,
          participant_count,
          is_active,
          created_at,
          updated_at
        `)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Fetch creator profiles separately to avoid relation issues
      const conversationsWithProfiles: Conversation[] = [];
      
      for (const conv of data || []) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, full_name")
          .eq("user_id", conv.creator_id)
          .maybeSingle();
        
        conversationsWithProfiles.push({
          ...conv,
          profiles: profileData || { username: '', full_name: '' }
        });
      }
      
      setConversations(conversationsWithProfiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  const createConversation = async () => {
    if (!newConversationTitle.trim() || !user) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          title: newConversationTitle.trim(),
          creator_id: user.id,
          conversation_type: "general",
          difficulty_level: "beginner"
        })
        .select()
        .single();

      if (error) throw error;

      setNewConversationTitle("");
      setShowCreateForm(false);
      await fetchConversations();
      onSelectConversation(data.id);

      toast({
        title: "Success",
        description: "Conversation created successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'practice': return '🎯';
      case 'story': return '📖';
      default: return '💬';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-4">
          <div className="space-y-3">
            <Input
              placeholder="Conversation title..."
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createConversation()}
            />
            <div className="flex gap-2">
              <Button
                onClick={createConversation}
                disabled={isCreating || !newConversationTitle.trim()}
                size="sm"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
              selectedConversationId === conversation.id ? 'bg-accent border-primary' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(conversation.conversation_type)}</span>
                  <h3 className="font-medium text-sm line-clamp-1">{conversation.title}</h3>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getDifficultyColor(conversation.difficulty_level)} text-white`}
                >
                  {conversation.difficulty_level}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{conversation.message_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{conversation.participant_count || 1}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                by {conversation.profiles?.full_name || conversation.profiles?.username || 'Anonymous'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConversationManager;