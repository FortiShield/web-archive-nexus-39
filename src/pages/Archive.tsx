
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react';
import { archiveApi, Snapshot } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

const Archive = () => {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) return;

    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await archiveApi.getSnapshots(domain);
        setSnapshots(response.snapshots);
      } catch (err) {
        setError('Failed to load snapshots. Make sure the backend is running on http://localhost:8000');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [domain]);

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
              {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} found
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

        {snapshots.length === 0 && !error ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No snapshots found</h3>
              <p className="text-muted-foreground">
                No archived versions found for {domain}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </h2>
            {snapshots.map((snapshot, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
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
      </div>
    </div>
  );
};

export default Archive;
