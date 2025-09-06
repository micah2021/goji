import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface AudioUploadDialogProps {
  onUploadComplete?: () => void;
}

const AudioUploadDialog = ({ onUploadComplete }: AudioUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contextType: "",
    culturalSignificance: "",
    geographicalRegion: "",
    elderName: "",
    recordingDate: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const { user } = useAuth();

  const contextTypes = [
    { value: "folktale", label: "Folktale • Tatsuniya" },
    { value: "song", label: "Song • Waƙa" },
    { value: "history", label: "History • Tarihi" },
    { value: "tradition", label: "Tradition • Al'ada" },
    { value: "ceremony", label: "Ceremony • Biki" },
    { value: "wisdom", label: "Wisdom • Hikima" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        toast.error("Please select an audio file");
        return;
      }
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !audioFile) return;

    setIsUploading(true);
    try {
      // Upload audio file to storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `elder-recordings/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-audio')
        .upload(fileName, audioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-audio')
        .getPublicUrl(fileName);

      // Create cultural context entry
      const { data: contextData, error: contextError } = await supabase
        .from('cultural_contexts')
        .insert({
          title: formData.title,
          description: formData.description,
          context_type: formData.contextType,
          cultural_significance: formData.culturalSignificance,
          geographical_region: formData.geographicalRegion,
          difficulty_level: 'intermediate'
        })
        .select()
        .single();

      if (contextError) throw contextError;

      // Create audio recording entry
      const { error: recordingError } = await supabase
        .from('audio_recordings')
        .insert({
          user_id: user.id,
          file_url: publicUrl,
          audio_format: fileExt,
          file_size: audioFile.size,
          transcription: `Elder recording: ${formData.title}`,
          processing_status: 'completed'
        });

      if (recordingError) throw recordingError;

      toast.success("Elder recording uploaded successfully!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        contextType: "",
        culturalSignificance: "",
        geographicalRegion: "",
        elderName: "",
        recordingDate: "",
      });
      setAudioFile(null);
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload recording. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Elder Recording
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Elder Recording</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Audio File Upload */}
          <div>
            <Label htmlFor="audio-file">Audio Recording *</Label>
            <div className="mt-1">
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                required
              />
            </div>
            {audioFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Origin Story of Fiauri Clan"
              required
            />
          </div>

          {/* Context Type */}
          <div>
            <Label htmlFor="context-type">Type *</Label>
            <Select 
              value={formData.contextType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, contextType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recording type" />
              </SelectTrigger>
              <SelectContent>
                {contextTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Elder Name */}
          <div>
            <Label htmlFor="elder-name">Elder Name</Label>
            <Input
              id="elder-name"
              value={formData.elderName}
              onChange={(e) => setFormData(prev => ({ ...prev, elderName: e.target.value }))}
              placeholder="Name of the elder sharing the story"
            />
          </div>

          {/* Recording Date */}
          <div>
            <Label htmlFor="recording-date">Recording Date</Label>
            <Input
              id="recording-date"
              type="date"
              value={formData.recordingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, recordingDate: e.target.value }))}
            />
          </div>

          {/* Geographical Region */}
          <div>
            <Label htmlFor="region">Geographical Region</Label>
            <Input
              id="region"
              value={formData.geographicalRegion}
              onChange={(e) => setFormData(prev => ({ ...prev, geographicalRegion: e.target.value }))}
              placeholder="e.g., Janga, Gwandum, Billiri"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the recording content"
              rows={3}
            />
          </div>

          {/* Cultural Significance */}
          <div>
            <Label htmlFor="significance">Cultural Significance</Label>
            <Textarea
              id="significance"
              value={formData.culturalSignificance}
              onChange={(e) => setFormData(prev => ({ ...prev, culturalSignificance: e.target.value }))}
              placeholder="Why is this recording important to Goji culture?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !audioFile}>
              {isUploading ? "Uploading..." : "Upload Recording"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AudioUploadDialog;