import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
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

  const handleUpload = () => {
    // TODO: Implement upload to Supabase storage
    console.log("Upload audio blob:", audioBlob);
  };

  return (
    <Card className="p-6 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Goji Keeper</h2>
        <p className="text-muted-foreground">Record • Preserve • Share</p>
        <p className="text-sm text-muted-foreground">Rikodin • Kiyaye • Raba</p>
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
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="w-24 h-24 rounded-full flex items-center justify-center"
          >
            <Square className="h-8 w-8" />
          </Button>
        )}

        {audioBlob && (
          <div className="flex items-center space-x-4">
            <Button
              onClick={isPlaying ? pauseAudio : playAudio}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button onClick={handleUpload} className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="text-sm text-muted-foreground animate-pulse">
          Recording... • Yana rikodin...
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