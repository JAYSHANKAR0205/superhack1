import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Asset } from '@/types/asset';
import { Sparkles, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const EmailDraftModal = ({ isOpen, onClose, asset }: EmailDraftModalProps) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (asset && isOpen) {
      generateEmail();
    }
  }, [asset, isOpen]);

  const generateEmail = () => {
    if (!asset) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const daysSince = Math.floor((Date.now() - new Date(asset.last_seen).getTime()) / (1000 * 60 * 60 * 24));
      
      setSubject(`Action Required: Asset ${asset.asset_id} Recovery`);
      setBody(`Dear ${asset.owner},

I hope this message finds you well. I'm reaching out regarding company asset ${asset.asset_id} (${asset.model || 'device'}) that was last seen at ${asset.location} approximately ${daysSince} days ago.

Our records indicate this asset, valued at $${asset.value.toLocaleString()}, has not been checked in recently. To ensure proper asset management and security compliance, we kindly request:

1. Confirmation of the asset's current location
2. If the asset is no longer in use, arrangement for its return to IT services
3. Any updates regarding the asset's status

Please respond within 5 business days. If you need assistance with return logistics or have questions about this asset, feel free to reach out.

Thank you for your cooperation in maintaining our asset inventory.

Best regards,
Asset Recovery Team`);
      
      setIsGenerating(false);
    }, 1000);
  };

  const handleSend = () => {
    toast({
      title: 'Email sent (simulated)',
      description: `Recovery email sent to ${asset?.owner}`,
      variant: 'default'
    });
    onClose();
  };

  const handleSave = () => {
    toast({
      title: 'Draft saved',
      description: 'Email draft has been saved',
      variant: 'default'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Draft Recovery Email
          </DialogTitle>
          <DialogDescription>
            AI-generated recovery email for {asset?.asset_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              value={asset?.owner || ''}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isGenerating}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={generateEmail} variant="outline" disabled={isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleSend}>
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
