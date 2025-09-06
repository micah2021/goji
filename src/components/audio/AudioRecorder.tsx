import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import gojiLogo from "@/assets/goji-logo.png";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
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
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({ title: "Recording started", description: "Speak clearly in Goji" });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({ title: "Error", description: "Could not access microphone", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    
    setIsSaving(true);
    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Recording saved!", description: "Your Goji recording has been preserved" });
      clearRecording();
    } catch (error) {
      toast({ title: "Error", description: "Could not save recording", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 text-center space-y-6">
      <div className="space-y-4">
        {/* Goji Logo */}
        <div className="flex justify-center">
          <img 
            src={gojiLogo} 
            alt="Goji Language Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Goji Keeper</h2>
          <p className="text-muted-foreground">Record • Preserve • Share</p>
          <p className="text-sm text-muted-foreground">Rikodin • Kiyaye • Raba</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className={cn(
              "w-24 h-24 rounded-full",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "flex items-center justify-center transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}
          >
            <Mic className="h-8 w-8" />
          </Button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
            >
              <Square className="h-8 w-8" />
            </Button>
            <div className="text-lg font-mono text-foreground">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {audioBlob && (
          <div className="w-full space-y-4">
            <div className="flex justify-center items-center space-x-4">
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Recording"}</span>
              </Button>
              
              <Button 
                onClick={clearRecording}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </div>
            
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Recording duration: {formatTime(recordingTime)}
              </p>
              <p className="text-xs text-muted-foreground">
                Tsawon rikodin: {formatTime(recordingTime)}
              </p>
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground animate-pulse">
            Recording... • Yana rikodin...
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </Card>
  );
};

export default AudioRecorder;