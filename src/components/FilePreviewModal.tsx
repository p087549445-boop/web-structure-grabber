import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Copy, X, Code2, FileText, Image, Palette, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  extension?: string;
  children?: FileItem[];
  content?: string;
  path: string;
}

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal = ({ file, isOpen, onClose, onDownload }: FilePreviewModalProps) => {
  const { toast } = useToast();

  if (!file) return null;

  const getFileIcon = () => {
    switch (file.extension) {
      case 'html':
        return <Code2 className="w-5 h-5 text-terminal-orange" />;
      case 'css':
        return <Palette className="w-5 h-5 text-blue-400" />;
      case 'js':
        return <Settings className="w-5 h-5 text-yellow-400" />;
      case 'php':
        return <Code2 className="w-5 h-5 text-purple-400" />;
      case 'md':
        return <FileText className="w-5 h-5 text-terminal-green" />;
      case 'png':
      case 'jpg':
      case 'gif':
      case 'svg':
        return <Image className="w-5 h-5 text-pink-400" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getLanguageForHighlighting = () => {
    switch (file.extension) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'php': return 'php';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  const copyToClipboard = async () => {
    if (!file.content) return;
    
    try {
      await navigator.clipboard.writeText(file.content);
      toast({
        title: "📋 Berhasil di-copy!",
        description: `Konten ${file.name} telah disalin ke clipboard`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Gagal menyalin ke clipboard",
        variant: "destructive",
      });
    }
  };

  const isImageFile = (extension?: string) => {
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension || '');
  };

  const isBinaryFile = (extension?: string) => {
    return ['woff', 'woff2', 'ttf', 'eot', 'ico', 'zip', 'pdf'].includes(extension || '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-card border-primary/20">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <DialogTitle className="font-mono text-lg text-foreground">
                {file.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {file.path} • {file.size}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="font-mono border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-primary-foreground"
              disabled={!file.content}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(file)}
              className="font-mono border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!file.content ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground font-mono">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Konten file tidak tersedia untuk preview</p>
                <p className="text-xs mt-1">File mungkin binary atau tidak dapat dibaca</p>
              </div>
            </div>
          ) : isImageFile(file.extension) ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground font-mono">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Preview gambar tidak tersedia</p>
                <p className="text-xs mt-1">Gunakan download untuk melihat file</p>
              </div>
            </div>
          ) : isBinaryFile(file.extension) ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground font-mono">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>File binary tidak dapat di-preview</p>
                <p className="text-xs mt-1">Gunakan download untuk mengambil file</p>
              </div>
            </div>
          ) : (
            <div className="bg-code-bg rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/10">
                <span className="text-xs text-muted-foreground">
                  {getLanguageForHighlighting().toUpperCase()} • {file.content.split('\n').length} lines
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.content.length / 1024).toFixed(1)} KB
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-foreground overflow-auto max-h-96 leading-relaxed">
                <code>{file.content}</code>
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};