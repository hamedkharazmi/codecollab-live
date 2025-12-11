import React, { useState } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ShareLinkProps {
  link: string;
}

export const ShareLink: React.FC<ShareLinkProps> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your candidate.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-2">
      <Link className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={link}
        readOnly
        className="flex-1 bg-transparent text-sm text-foreground outline-none"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
