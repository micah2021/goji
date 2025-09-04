import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

export const KushiImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    
    try {
      console.log('Starting Kushi wordlist import...');
      
      const { data, error } = await supabase.functions.invoke('import-kushi-wordlist');
      
      console.log('Import response:', { data, error });
      
      if (error) {
        throw error;
      }
      
      setImportStatus('success');
      toast({
        title: "Import Successful!",
        description: `Imported ${data.stats?.total_inserted || 0} Kushi dictionary entries`,
      });
      
      // Refresh the page after successful import
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error importing Kushi wordlist:', error);
      setImportStatus('error');
      toast({
        title: "Import failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getButtonContent = () => {
    if (isImporting) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
          Importing...
        </>
      );
    }
    
    if (importStatus === 'success') {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Import Complete!
        </>
      );
    }
    
    if (importStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2" />
          Try Again
        </>
      );
    }
    
    return (
      <>
        <Download className="w-4 h-4 mr-2" />
        Import Kushi Dictionary
      </>
    );
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={isImporting || importStatus === 'success'}
      variant={importStatus === 'error' ? "destructive" : "default"}
      size="sm"
      className="font-medium"
    >
      {getButtonContent()}
    </Button>
  );
};