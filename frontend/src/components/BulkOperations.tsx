
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Archive, CheckSquare, Square } from 'lucide-react';
import { Snapshot } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

interface BulkOperationsProps {
  snapshots: Snapshot[];
  selectedSnapshots: string[];
  onSelectionChange: (selected: string[]) => void;
  onBulkExport: (snapshots: Snapshot[]) => void;
  onBulkDelete?: (snapshots: Snapshot[]) => void;
}

const BulkOperations = ({ 
  snapshots, 
  selectedSnapshots, 
  onSelectionChange, 
  onBulkExport,
  onBulkDelete 
}: BulkOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = snapshots.length > 0 && selectedSnapshots.length === snapshots.length;
  const someSelected = selectedSnapshots.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(snapshots.map(s => s.timestamp));
    }
  };

  const getSelectedSnapshots = () => {
    return snapshots.filter(s => selectedSnapshots.includes(s.timestamp));
  };

  const handleBulkExport = async () => {
    const selected = getSelectedSnapshots();
    if (selected.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkExport(selected);
      toast({
        title: "Export Started",
        description: `Exporting ${selected.length} snapshots...`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to start export process",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    const selected = getSelectedSnapshots();
    if (selected.length === 0 || !onBulkDelete) return;
    
    setIsProcessing(true);
    try {
      await onBulkDelete(selected);
      onSelectionChange([]);
      toast({
        title: "Snapshots Deleted",
        description: `Deleted ${selected.length} snapshots`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete snapshots",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (snapshots.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="h-4 w-4" />
            Bulk Operations
          </CardTitle>
          <Badge variant="secondary">
            {selectedSnapshots.length} / {snapshots.length} selected
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Select All */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSelectAll}
            className="flex items-center gap-2"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Bulk Actions */}
        {someSelected && (
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              onClick={handleBulkExport}
              disabled={isProcessing}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export ({selectedSnapshots.length})
            </Button>
            
            {onBulkDelete && (
              <Button 
                onClick={handleBulkDelete}
                disabled={isProcessing}
                size="sm"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedSnapshots.length})
              </Button>
            )}
          </div>
        )}

        {/* Selection Info */}
        {someSelected && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Selected snapshots: {getSelectedSnapshots().map(s => 
              new Date(s.timestamp).toLocaleDateString()
            ).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkOperations;
