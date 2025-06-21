
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, ExternalLink, LayoutGrid, List as ListIcon } from 'lucide-react';
import { archiveApi, Snapshot } from '@/utils/api';
import { toast } from '@/hooks/use-toast';
import SnapshotFilters, { FilterOptions } from '@/components/SnapshotFilters';
import BulkOperations from '@/components/BulkOperations';
import CalendarView from '@/components/CalendarView';
import ExportModal from '@/components/ExportModal';

const Archive = () => {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [filteredSnapshots, setFilteredSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (!domain) return;

    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await archiveApi.getSnapshots(domain);
        setSnapshots(response.snapshots);
        setFilteredSnapshots(response.snapshots);
      } catch (err) {
        setError('Failed to load snapshots. Make sure the backend is running on http://localhost:8000');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [domain]);

  // Apply filters whenever filters or snapshots change
  useEffect(() => {
    let filtered = [...snapshots];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter(s => {
        if (!s.size) return false;
        const sizeValue = parseFloat(s.size);
        switch (filters.size) {
          case 'small': return sizeValue < 1;
          case 'medium': return sizeValue >= 1 && sizeValue <= 5;
          case 'large': return sizeValue > 5;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(s => {
        const snapshotDate = new Date(s.timestamp);
        if (filters.dateRange?.from && snapshotDate < filters.dateRange.from) return false;
        if (filters.dateRange?.to && snapshotDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Content search filter (simulated)
    if (filters.searchContent) {
      const searchTerm = filters.searchContent.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(searchTerm) ||
        s.url.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSnapshots(filtered);
  }, [filters, snapshots]);

  const handleViewSnapshot = (snapshot: Snapshot) => {
    if (snapshot.status === 'completed') {
      navigate(`/snapshot/${domain}/${snapshot.timestamp}`);
    } else {
      toast({
        title: "Snapshot unavailable",
        description: `This snapshot is ${snapshot.status}`,
        variant: "destructive"
      });
    }
  };

  const handleBulkExport = async (snapshots: Snapshot[]) => {
    setShowExportModal(true);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading snapshots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Archive: {domain}</h1>
            <p className="text-muted-foreground">
              {filteredSnapshots.length} of {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} shown
            </p>
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {snapshots.length > 0 && (
          <>
            {/* Filters */}
            <div className="mb-6">
              <SnapshotFilters 
                onFiltersChange={setFilters}
                currentFilters={filters}
              />
            </div>

            {/* Bulk Operations */}
            <div className="mb-6">
              <BulkOperations
                snapshots={filteredSnapshots}
                selectedSnapshots={selectedSnapshots}
                onSelectionChange={setSelectedSnapshots}
                onBulkExport={handleBulkExport}
              />
            </div>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
              <TabsList className="mb-6">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <ListIcon className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                {filteredSnapshots.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No snapshots found</h3>
                      <p className="text-muted-foreground">
                        {snapshots.length === 0 
                          ? `No archived versions found for ${domain}`
                          : 'No snapshots match your current filters'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timeline
                    </h2>
                    {filteredSnapshots.map((snapshot, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedSnapshots.includes(snapshot.timestamp)}
                                onChange={(e) => {
                                  const newSelection = e.target.checked
                                    ? [...selectedSnapshots, snapshot.timestamp]
                                    : selectedSnapshots.filter(t => t !== snapshot.timestamp);
                                  setSelectedSnapshots(newSelection);
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="font-medium text-foreground">
                                    {snapshot.title || domain}
                                  </h3>
                                  <Badge className={getStatusColor(snapshot.status)}>
                                    {snapshot.status}
                                  </Badge>
                                  {snapshot.size && (
                                    <Badge variant="secondary">{snapshot.size}</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Clock className="h-4 w-4" />
                                  {formatDate(snapshot.timestamp)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {snapshot.url}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleViewSnapshot(snapshot)}
                              disabled={snapshot.status !== 'completed'}
                              className="ml-4"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView
                  snapshots={filteredSnapshots}
                  onSnapshotSelect={handleViewSnapshot}
                  selectedSnapshots={selectedSnapshots}
                  onSelectionChange={setSelectedSnapshots}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          snapshots={filteredSnapshots.filter(s => selectedSnapshots.includes(s.timestamp))}
        />
      </div>
    </div>
  );
};

export default Archive;
