import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen, 
  Download,
  Eye,
  Code2,
  FileText,
  Image,
  Palette,
  Settings
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  extension?: string;
  children?: FileItem[];
  content?: string;
  path: string;
}

interface FileTreeViewProps {
  structure: FileItem[];
  onDownloadFile: (file: FileItem) => void;
  onPreviewFile: (file: FileItem) => void;
}

export const FileTreeView = ({ structure, onDownloadFile, onPreviewFile }: FileTreeViewProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.path) ? 
        <FolderOpen className="w-4 h-4 text-terminal-cyan" /> : 
        <Folder className="w-4 h-4 text-terminal-cyan" />;
    }

    switch (file.extension) {
      case 'html':
        return <Code2 className="w-4 h-4 text-terminal-orange" />;
      case 'css':
        return <Palette className="w-4 h-4 text-blue-400" />;
      case 'js':
        return <Settings className="w-4 h-4 text-yellow-400" />;
      case 'php':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-terminal-green" />;
      case 'png':
      case 'jpg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-pink-400" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getFileTypeColor = (extension?: string) => {
    switch (extension) {
      case 'html': return 'text-terminal-orange';
      case 'css': return 'text-blue-400';
      case 'js': return 'text-yellow-400';
      case 'php': return 'text-purple-400';
      case 'md': return 'text-terminal-green';
      case 'png':
      case 'jpg':
      case 'gif':
      case 'svg': return 'text-pink-400';
      default: return 'text-muted-foreground';
    }
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.path} className="animate-fade-in">
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-code-bg/50 rounded-lg transition-all duration-200 group"
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {item.type === 'folder' && (
            <button
              onClick={() => toggleFolder(item.path)}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
            >
              {expandedFolders.has(item.path) ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getFileIcon(item)}
            <span className={`font-mono text-sm ${getFileTypeColor(item.extension)} truncate`}>
              {item.name}
            </span>
            {item.size && (
              <span className="text-xs text-muted-foreground font-mono">
                {item.size}
              </span>
            )}
          </div>

          {item.type === 'file' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPreviewFile(item)}
                className="h-7 w-7 p-0 hover:bg-terminal-cyan/20 hover:text-terminal-cyan"
                title="Preview file"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDownloadFile(item)}
                className="h-7 w-7 p-0 hover:bg-terminal-green/20 hover:text-terminal-green"
                title="Download file"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        
        {item.type === 'folder' && item.children && expandedFolders.has(item.path) && (
          <div className="ml-2">
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Card className="bg-gradient-card border-primary/20">
      <div className="p-4 border-b border-primary/10">
        <h3 className="text-lg font-semibold text-primary font-mono flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Struktur File Website
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Klik folder untuk expand, hover file untuk aksi
        </p>
      </div>
      
      <div className="p-2 max-h-96 overflow-auto">
        {structure.length > 0 ? (
          renderFileTree(structure)
        ) : (
          <div className="text-center py-8 text-muted-foreground font-mono">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Tidak ada struktur file ditemukan</p>
          </div>
        )}
      </div>
    </Card>
  );
};