
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { archiveApi } from '@/utils/api';

const SnapshotViewer = () => {
  const { domain, timestamp } = useParams<{ domain: string; timestamp: string }>();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain || !timestamp) return;

    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        setError(null);
        const content = await archiveApi.getSnapshot(domain, timestamp);
        setHtmlContent(content);
      } catch (err) {
        setError('Failed to load snapshot. Make sure the backend is running on http://localhost:8000');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, [domain, timestamp]);

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading snapshot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(`/archive/${domain}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Archive
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{domain}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {timestamp && formatDate(timestamp)}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              New Search
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {error ? (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => navigate(`/archive/${domain}`)}>
                Back to Archive
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={htmlContent}
              className="w-full h-[calc(100vh-200px)]"
              title={`Archived snapshot of ${domain} from ${timestamp}`}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SnapshotViewer;
