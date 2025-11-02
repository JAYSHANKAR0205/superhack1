import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, AssetStatus } from '@/types/asset';
import { AssetTable } from '@/components/AssetTable';
import { ChatAssistant } from '@/components/ChatAssistant';
import { EmailDraftModal } from '@/components/EmailDraftModal';
import { Button } from '@/components/ui/button';
import { Package, BarChart3, Upload } from 'lucide-react';
import { mockAssets } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { listAssets, flagMissing, draftEmail } from '@/lib/api';

const Assets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAsset, setEmailAsset] = useState<Asset | null>(null);

  useEffect(() => {
    // Load assets from backend API
    listAssets()
      .then(setAssets)
      .catch(error => {
        console.error('Failed to load assets:', error);
        toast({
          title: 'Error loading assets',
          description: error.message,
          variant: 'destructive'
        });
        // Fallback to mock data
        setAssets(mockAssets);
      });
  }, [toast]);

  const handleUpdateStatus = async (assetId: string, status: AssetStatus) => {
    try {
      if (status === 'Missing') {
        await flagMissing(Number(assetId));
      }
      // Refresh asset list
      const updatedAssets = await listAssets();
      setAssets(updatedAssets);
      
      toast({
        title: 'Status updated',
        description: `Asset marked as ${status}`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDraftEmail = async (asset: Asset) => {
    try {
      const result = await draftEmail(Number(asset.id));
      setEmailAsset({ ...asset, draftedEmail: result.email });
      setEmailModalOpen(true);
    } catch (error: any) {
      console.error('Failed to draft email:', error);
      toast({
        title: 'Error drafting email',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleOpenChat = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">ReclaimIT</h1>
              </div>
              <nav className="flex gap-4">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </nav>
            </div>
            <Button onClick={() => setIsChatOpen(true)}>
            AI Assistant
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Asset Management</h2>
            <p className="text-muted-foreground mt-2">
              Track, filter, and manage asset recovery across your organization
            </p>
          </div>

          <AssetTable
            assets={assets}
            onUpdateStatus={handleUpdateStatus}
            onDraftEmail={handleDraftEmail}
            onOpenChat={handleOpenChat}
          />
        </div>
      </main>

      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedAsset={selectedAsset}
      />

      <EmailDraftModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        asset={emailAsset}
      />
    </div>
  );
};

export default Assets;
