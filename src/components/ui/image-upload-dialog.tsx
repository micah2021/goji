import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface ImageUploadDialogProps {
  onUploadComplete?: (imageUrl: string, caption?: string) => void;
  triggerButton?: React.ReactNode;
  maxSizeMB?: number;
}

const ImageUploadDialog = ({ 
  onUploadComplete, 
  triggerButton,
  maxSizeMB = 10 
}: ImageUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) return;

    setIsUploading(true);
    try {
      // Compress image
      const compressedFile = await compressImage(imageFile);
      
      // Upload image file to storage
      const fileExt = 'jpg'; // Always save as JPG after compression
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      toast.success("Image uploaded successfully!");
      onUploadComplete?.(publicUrl, caption);
      
      // Reset form
      setOpen(false);
      setImageFile(null);
      setPreview(null);
      setCaption("");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <ImageIcon className="h-4 w-4" />
      Upload Image
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label htmlFor="image-file">Select Image *</Label>
            <div className="mt-1">
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!imageFile}
                className={preview ? "hidden" : ""}
              />
            </div>
            
            {/* Preview */}
            {preview && (
              <div className="mt-2 relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {imageFile && (
              <p className="text-sm text-muted-foreground mt-1">
                {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your image..."
              rows={2}
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
            <Button type="submit" disabled={isUploading || !imageFile}>
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;