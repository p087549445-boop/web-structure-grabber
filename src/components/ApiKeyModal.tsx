import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FirecrawlService } from '@/services/FirecrawlService';
import { Key, Loader2, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: () => void;
}

export const ApiKeyModal = ({ isOpen, onClose, onApiKeySet }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    
    try {
      const isValid = await FirecrawlService.testApiKey(apiKey.trim());
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey.trim());
        toast({
          title: "✅ API Key Valid!",
          description: "API key berhasil disimpan dan siap digunakan",
        });
        onApiKeySet();
        onClose();
        setApiKey('');
      } else {
        toast({
          title: "❌ API Key Tidak Valid",
          description: "Silakan periksa kembali API key Anda",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Gagal memvalidasi API key",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-primary/20">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terminal-green/20 rounded-lg">
              <Key className="w-6 h-6 text-terminal-green" />
            </div>
            <DialogTitle className="text-xl font-mono text-foreground">
              Setup Firecrawl API Key
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-mono">
            Saat ini menggunakan demo mode. Untuk scraping real-time, 
            Anda perlu mengimplementasikan backend API dengan Firecrawl.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="apikey" className="text-sm font-mono font-medium text-foreground">
              🔑 Firecrawl API Key
            </Label>
            <Input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono bg-code-bg border-primary/30 focus:border-terminal-green focus:ring-terminal-green/50"
              placeholder="fc-xxxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
            <p className="text-xs text-muted-foreground font-mono">
              API key akan disimpan secara lokal di browser Anda
            </p>
          </div>

          <div className="bg-code-bg p-4 rounded-lg border border-primary/20">
            <h4 className="text-sm font-mono font-semibold text-terminal-cyan mb-2">
              📖 Mode Demo Saat Ini:
            </h4>
            <ul className="text-xs text-muted-foreground font-mono space-y-1 list-disc list-inside">
              <li>Menggunakan demo data untuk simulasi</li>
              <li>Untuk data asli, implementasikan backend API</li>
              <li>Firecrawl SDK memerlukan server-side integration</li>
              <li>Format: <code>fc-xxxxxxxxxx</code> (demo validation)</li>
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 font-mono border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-primary-foreground"
              onClick={() => window.open('https://firecrawl.dev', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Buka Firecrawl.dev
            </Button>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-mono"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!apiKey.trim() || isValidating}
              className="bg-terminal-green hover:bg-terminal-green/90 text-primary-foreground font-mono font-semibold"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Simpan API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};