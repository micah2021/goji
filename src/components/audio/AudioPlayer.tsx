import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
  showWaveform?: boolean;
}

const AudioPlayer = ({ audioUrl, className, showWaveform = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  console.log('AudioPlayer: Rendering with URL:', audioUrl);
  console.log('AudioPlayer: isLoading:', isLoading, 'isPlaying:', isPlaying, 'duration:', duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('AudioPlayer: No audio ref found');
      return;
    }

    console.log('AudioPlayer: Setting up audio element with URL:', audioUrl);
    setIsLoading(true);
    setAudioError(null);

    const handleLoadedMetadata = () => {
      console.log('AudioPlayer: Loaded metadata, duration:', audio.duration);
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log('AudioPlayer: Audio ended');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlayThrough = () => {
      console.log('AudioPlayer: Can play through');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      console.log('AudioPlayer: Can play');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('AudioPlayer: Load started');
      setIsLoading(true);
    };

    const handleError = (e: Event) => {
      const errorMsg = `Audio error: ${(e.target as HTMLAudioElement)?.error?.message || 'Unknown error'}`;
      console.error('AudioPlayer:', errorMsg, e);
      setIsLoading(false);
      setAudioError(errorMsg);
      toast({
        title: "Audio Error",
        description: "Could not load audio file. Try refreshing the page.",
        variant: "destructive"
      });
    };

    // Add all event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);

    // Force load the audio
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, toast]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('AudioPlayer: No audio element available for playback');
      return;
    }

    console.log('AudioPlayer: Toggle play called. Current state:', { isPlaying, readyState: audio.readyState, src: audio.src });

    try {
      if (isPlaying) {
        console.log('AudioPlayer: Pausing audio');
        audio.pause();
        setIsPlaying(false);
      } else {
        // Reset to beginning if ended
        if (audio.ended) {
          console.log('AudioPlayer: Resetting to beginning');
          audio.currentTime = 0;
        }

        // Ensure audio is loaded before playing
        if (audio.readyState < 2) {
          console.log('AudioPlayer: Audio not ready, loading...');
          audio.load();
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000);

            const handleCanPlay = () => {
              console.log('AudioPlayer: Audio ready for playback');
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleCanPlay);
              audio.removeEventListener('error', handleError);
              resolve(void 0);
            };

            const handleError = (e: Event) => {
              console.error('AudioPlayer: Load error during play attempt:', e);
              clearTimeout(timeout);
              audio.removeEventListener('canplay', handleCanPlay);
              audio.removeEventListener('error', handleError);
              reject(new Error('Audio load failed'));
            };

            audio.addEventListener('canplay', handleCanPlay);
            audio.addEventListener('error', handleError);
          });
        }

        console.log('AudioPlayer: Attempting to play audio');
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('AudioPlayer: Play successful');
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('AudioPlayer: Play/pause error:', error);
      setAudioError(`Playback failed: ${error.message}`);
      
      // Try to reload and play again as fallback
      try {
        console.log('AudioPlayer: Attempting fallback play');
        audio.load();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        const fallbackPromise = audio.play();
        if (fallbackPromise !== undefined) {
          await fallbackPromise;
          setIsPlaying(true);
        }
      } catch (fallbackError) {
        console.error('AudioPlayer: Fallback play failed:', fallbackError);
        toast({
          title: "Playback Error",
          description: "Audio playback failed. Please check your internet connection and try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlay}
        disabled={isLoading || !!audioError}
        className="flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
        ) : audioError ? (
          <span className="text-xs text-destructive">Error</span>
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        <div 
          className="w-full h-2 bg-secondary rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-primary rounded-full transition-all duration-150 group-hover:bg-primary/80"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mobile Fallback Options */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(audioUrl, '_blank')}
          className="h-6 w-6 p-0"
          title="Open audio in new tab"
        >
          📱
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = 'audio.mp3';
            a.click();
          }}
          className="h-6 w-6 p-0"
          title="Download audio"
        >
          📥
        </Button>
      </div>

      <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        playsInline
        controls={false}
        className="hidden"
        muted={false}
      />

      {/* Debug info - remove in production */}
      {audioError && (
        <div className="text-xs text-destructive mt-1">
          Debug: {audioError}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;