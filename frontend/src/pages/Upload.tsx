import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVUpload } from '@/components/CSVUpload';
import { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);

  const handleUploadComplete = (assets: Asset[]) => {
    setUploadedAssets(assets);
    // Store in localStorage for demo purposes
    localStorage.setItem('assets', JSON.stringify(assets));
  };

  const handleContinue = () => {
    navigate('/assets');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ReclaimIT</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Import Your Assets Details</h2>
            <p className="text-lg text-muted-foreground">
              Upload a CSV file to begin tracking and recovering your company's assets
            </p>
          </div>

          <CSVUpload onUploadComplete={handleUploadComplete} />

          {uploadedAssets.length > 0 && (
            <div className="flex flex-col items-center gap-4 p-6 bg-success/10 border border-success/20 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-success">
                  Successfully imported {uploadedAssets.length} assets
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to start managing your asset recovery
                </p>
              </div>
              <Button onClick={handleContinue} size="lg">
                Continue to Assets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
