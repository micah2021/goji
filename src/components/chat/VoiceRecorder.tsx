import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Send, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface VoiceRecorderProps {
  conversationId: string;
  onAudioSent: () => void;
  disabled?: boolean;
}

const VoiceRecorder = ({ conversationId, onAudioSent, disabled }: VoiceRecorderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        recordedBlobRef.current = audioBlob;
        setHasRecording(true);
        cleanupRecording();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const discardRecording = () => {
    recordedBlobRef.current = null;
    setHasRecording(false);
    setRecordingTime(0);
  };

  const sendRecording = async () => {
    if (!recordedBlobRef.current || !user) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `audio_${Date.now()}_${user.id}.webm`;
      const filePath = `${user.id}/conversations/${conversationId}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-audio')
        .upload(filePath, recordedBlobRef.current, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-audio')
        .getPublicUrl(uploadData.path);

      // Create message with audio
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          text: '[Audio Message]',
          audio_url: publicUrl,
          tags: 'audio'
        });

      if (messageError) throw messageError;

      // Create audio recording record for AI analysis
      await supabase
        .from('audio_recordings')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          file_url: publicUrl,
          file_size: recordedBlobRef.current.size,
          duration_seconds: recordingTime,
          audio_format: 'webm',
          processing_status: 'pending'
        });

      toast({
        title: "Success",
        description: "Voice message sent!"
      });

      // Reset state
      discardRecording();
      onAudioSent();

    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasRecording) {
    return (
      <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
        <div className="flex-1 text-sm">
          Voice message ({formatTime(recordingTime)})
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={discardRecording}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={sendRecording}
          disabled={isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="animate-pulse"
        >
          <Square className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          {formatTime(recordingTime)}
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startRecording}
      disabled={disabled}
      className="flex-shrink-0"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};

export default VoiceRecorder;