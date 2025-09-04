import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkImportDialogProps {
  onImportComplete: () => void;
}

export const BulkImportDialog = ({ onImportComplete }: BulkImportDialogProps) => {
  const [textInput, setTextInput] = useState("");
  const [format, setFormat] = useState("csv");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!textInput.trim()) {
      toast({ title: "Error", description: "Please enter some text to import", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", description: "Please sign in to import words", variant: "destructive" });
        return;
      }

      // Parse input based on format
      let entries = [];
      if (format === "csv") {
        entries = parseCSV(textInput);
      } else if (format === "json") {
        entries = JSON.parse(textInput);
      } else {
        entries = parseSimpleText(textInput);
      }

      // Call bulk import function
      const { data, error } = await supabase.functions.invoke('bulk-dictionary-import', {
        body: { 
          action: 'upload',
          entries,
          userId: user.id
        }
      });

      if (error) throw error;

      setImportResults(data);
      toast({
        title: "Import completed!",
        description: `Processed ${data.processed_count} entries. ${data.validated_count} validated, ${data.needs_review_count} need review.`
      });
      
      onImportComplete();

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Please check your data format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (text: string) => {
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [goji_word, english_translation, hausa_translation, example_sentence, cultural_context] = 
          line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        return {
          goji_word,
          english_translation,
          hausa_translation,
          example_sentence,
          cultural_context
        };
      })
      .filter(entry => entry.goji_word);
  };

  const parseSimpleText = (text: string) => {
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('=').map(p => p.trim());
        if (parts.length >= 2) {
          return {
            goji_word: parts[0],
            english_translation: parts[1],
            hausa_translation: parts[2] || null,
            example_sentence: null,
            cultural_context: null
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const exampleCSV = `niyo,person,mutum,"niyo ɗo̱ƙ = one person","Basic kinship term"
wi,goat,akuya,"wi gbe = many goats","Important livestock animal"
mina,house,gida,"mina pomina = house room","Traditional dwelling"`;

  const exampleSimple = `niyo = person = mutum
wi = goat = akuya  
mina = house = gida`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Bulk Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Bulk Import Dictionary Entries
          </DialogTitle>
          <DialogDescription>
            Import multiple Goji words at once. The AI will validate and enhance each entry automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Input Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV Format</SelectItem>
                <SelectItem value="simple">Simple Format</SelectItem>
                <SelectItem value="json">JSON Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="textInput">Dictionary Entries</Label>
            <Textarea
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={format === "csv" ? exampleCSV : exampleSimple}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Format Examples:</h4>
            {format === "csv" && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">CSV Format (comma-separated):</p>
                <code className="block text-xs bg-background p-2 rounded">
                  {exampleCSV}
                </code>
              </div>
            )}
            {format === "simple" && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Simple Format (equals-separated):</p>
                <code className="block text-xs bg-background p-2 rounded">
                  {exampleSimple}
                </code>
              </div>
            )}
            {format === "json" && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">JSON Format:</p>
                <code className="block text-xs bg-background p-2 rounded">
                  {`[{"goji_word":"niyo","english_translation":"person","hausa_translation":"mutum"}]`}
                </code>
              </div>
            )}
          </div>

          {importResults && (
            <div className="bg-accent/20 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Import Results
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default">
                  Total: {importResults.processed_count}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Validated: {importResults.validated_count}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Need Review: {importResults.needs_review_count}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Batch ID: {importResults.batch_id}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              onClick={handleImport} 
              disabled={isProcessing || !textInput.trim()}
              className="min-w-[120px]"
            >
              {isProcessing ? "Processing..." : "Import Words"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};