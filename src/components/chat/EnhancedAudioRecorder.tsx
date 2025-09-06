import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Upload } from "lucide-react";

interface EnhancedAudioRecorderProps {
  conversationId?: string;
  onAudioUploaded: (audioUrl: string, messageId: string) => void;
  disabled?: boolean;
}

const EnhancedAudioRecorder = ({ conversationId, onAudioUploaded, disabled }: EnhancedAudioRecorderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      // Check if we're on HTTPS (required for mobile)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        toast({ 
          title: "HTTPS Required", 
          description: "Audio recording requires a secure connection on mobile devices", 
          variant: "destructive" 
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Use compatible MIME types for mobile
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        mimeType = 'audio/aac';
      } else if (MediaRecorder.isTypeSupported('audio/mpeg')) {
        mimeType = 'audio/mpeg';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAndUploadAudio(audioBlob, mimeType);
        cleanupRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly for best results"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
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
    setRecordingTime(0);
  };

  const processAndUploadAudio = async (audioBlob: Blob, mimeType: string) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Determine file extension based on MIME type
      const extension = mimeType.includes('mp4') ? 'mp4' : 
                       mimeType.includes('aac') ? 'aac' : 
                       mimeType.includes('mpeg') ? 'mp3' : 'webm';
      const fileName = `audio_${Date.now()}_${user.id}.${extension}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat-audio')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-audio')
        .getPublicUrl(fileName);

      // Create message record
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          text: "[Audio Message]",
          audio_url: publicUrl,
          tags: "audio",
          conversation_id: conversationId
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create detailed audio recording record for AI analysis
      const audioSize = audioBlob.size;
      const duration = recordingTime;

      await supabase
        .from("audio_recordings")
        .insert({
          message_id: messageData.id,
          conversation_id: conversationId,
          user_id: user.id,
          file_url: publicUrl,
          file_size: audioSize,
          duration_seconds: duration,
          audio_format: extension,
          processing_status: 'pending'
        });

      onAudioUploaded(publicUrl, messageData.id);

      toast({
        title: "Success",
        description: `Audio message sent! (${duration}s)`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload audio recording",
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

  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Mic className="h-4 w-4" />
      </Button>
    );
  }

  if (isUploading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Upload className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isRecording && (
        <span className="text-sm text-muted-foreground font-mono">
          {formatTime(recordingTime)}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : ""}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default EnhancedAudioRecorder;