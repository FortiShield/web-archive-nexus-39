
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Archive, Image } from 'lucide-react';
import { Snapshot } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: Snapshot[];
}

interface ExportOptions {
  format: 'zip' | 'json' | 'csv';
  includeMetadata: boolean;
  includeContent: boolean;
  includeImages: boolean;
}

const ExportModal = ({ isOpen, onClose, snapshots }: ExportModalProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'zip',
    includeMetadata: true,
    includeContent: true,
    includeImages: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Create export data based on format
      let exportData: any;
      let filename: string;
      let mimeType: string;

      switch (options.format) {
        case 'json':
          exportData = JSON.stringify({
            snapshots: snapshots.map(s => ({
              timestamp: s.timestamp,
              url: s.url,
              title: s.title,
              status: s.status,
              size: s.size,
              ...(options.includeMetadata && { 
                exportedAt: new Date().toISOString(),
                exportOptions: options 
              })
            })),
            totalCount: snapshots.length,
            exportedAt: new Date().toISOString(),
          }, null, 2);
          filename = `snapshots-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          const headers = ['Timestamp', 'URL', 'Title', 'Status', 'Size'];
          const csvContent = [
            headers.join(','),
            ...snapshots.map(s => [
              s.timestamp,
              s.url,
              s.title || '',
              s.status,
              s.size || ''
            ].map(field => `"${field}"`).join(','))
          ].join('\n');
          exportData = csvContent;
          filename = `snapshots-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        default:
          // For ZIP, we'll create a simple text file as a placeholder
          exportData = `Archive Export - ${snapshots.length} snapshots\n\n` +
            snapshots.map(s => 
              `${s.timestamp}: ${s.title || s.url} (${s.status})`
            ).join('\n');
          filename = `snapshots-${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
      }

      // Create and download file
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Successfully exported ${snapshots.length} snapshots`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export snapshots",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Snapshots ({snapshots.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select
              value={options.format}
              onValueChange={(value: 'zip' | 'json' | 'csv') => 
                setOptions({ ...options, format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    ZIP Archive
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Include</label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeMetadata: checked as boolean })
                }
              />
              <label htmlFor="metadata" className="text-sm">
                Metadata (timestamps, status, size)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="content"
                checked={options.includeContent}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeContent: checked as boolean })
                }
              />
              <label htmlFor="content" className="text-sm">
                Archived HTML content
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="images"
                checked={options.includeImages}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeImages: checked as boolean })
                }
              />
              <label htmlFor="images" className="text-sm">
                Images and assets
              </label>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Exporting...</div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
