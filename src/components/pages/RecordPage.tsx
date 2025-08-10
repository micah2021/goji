import AudioRecorder from "@/components/audio/AudioRecorder";

const RecordPage = () => {
  return (
    <div className="p-4 space-y-6 pb-20">
      <AudioRecorder />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Tips</h3>
        <div className="grid gap-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">🎯 Speak clearly and close to your device</p>
            <p className="text-xs text-muted-foreground">Yi magana da kyau kusa da na'urar ku</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">📝 Add translations after recording</p>
            <p className="text-xs text-muted-foreground">Ƙara fassarar bayan rikodin</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">🏆 Earn points for contributions</p>
            <p className="text-xs text-muted-foreground">Sami maki don gudummawa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;