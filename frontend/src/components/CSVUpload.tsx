import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types/asset';
import { bulkUpload, listAssets } from '@/lib/api';

interface CSVUploadProps {
  onUploadComplete: (assets: Asset[]) => void;
}

export const CSVUpload = ({ onUploadComplete }: CSVUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processCSV = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await bulkUpload(file);
      // After successful upload, fetch the updated assets
      const assets = await listAssets();
      onUploadComplete(assets);
      
      toast({
        title: 'Upload successful',
        description: `Imported ${result.created} assets`,
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      processCSV(file);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      });
    }
  }, [processCSV, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSV(file);
    }
  }, [processCSV]);

  return (
    <Card
      className={`p-12 border-2 border-dashed transition-all ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          {isProcessing ? (
            <FileSpreadsheet className="h-10 w-10 text-primary animate-pulse" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Upload Asset CSV</h3>
          <p className="text-muted-foreground max-w-md">
            Drag and drop your CSV file here, or click to browse
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>Supported columns: asset_id, owner, location, last_seen, status, value</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span>File must be in CSV format</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild disabled={isProcessing}>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
                disabled={isProcessing}
              />
              {isProcessing ? 'Processing...' : 'Choose File'}
            </label>
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/sample-assets.csv" download>
              Download Sample CSV
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};
