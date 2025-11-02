import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Sparkles } from 'lucide-react';
import { Asset } from '@/types/asset';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: Asset;
  onActionRequest?: (action: string, asset: Asset) => void;
}

export const ChatAssistant = ({ isOpen, onClose, selectedAsset, onActionRequest }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you with asset recovery. Try asking me about an asset\'s location, owner, or for disposition suggestions.'
    }
  ]);
  const [input, setInput] = useState('');

  const quickPrompts = [
    'Where was this asset last seen?',
    'Draft a recovery email',
    'Suggest disposition',
    'Who is the owner?'
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (selectedAsset) {
        if (input.toLowerCase().includes('last seen') || input.toLowerCase().includes('location')) {
          response = `Asset ${selectedAsset.asset_id} was last seen at ${selectedAsset.location} on ${selectedAsset.last_seen}.`;
        } else if (input.toLowerCase().includes('owner')) {
          response = `This asset is owned by ${selectedAsset.owner}.`;
        } else if (input.toLowerCase().includes('email') || input.toLowerCase().includes('draft')) {
          response = `I can help draft a recovery email. Would you like me to create a personalized outreach message for ${selectedAsset.owner}?`;
        } else if (input.toLowerCase().includes('disposition') || input.toLowerCase().includes('suggest')) {
          const value = selectedAsset.value;
          const recommendation = value > 1000 ? 
            'I recommend active recovery efforts given the high value ($' + value + '). Initiate immediate outreach to the owner.' :
            'Consider marking as write-off if recovery costs exceed asset value ($' + value + ').';
          response = recommendation;
        } else {
          response = `For asset ${selectedAsset.asset_id}: Status is ${selectedAsset.status}, valued at $${selectedAsset.value}. What would you like to know?`;
        }
      } else {
        response = 'Please select an asset from the table to get specific information.';
      }

      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 border-l bg-card shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {selectedAsset && (
        <div className="p-4 border-b bg-muted/50">
          <p className="text-sm font-medium">Selected: {selectedAsset.asset_id}</p>
          <p className="text-xs text-muted-foreground">{selectedAsset.owner}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about assets..."
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
