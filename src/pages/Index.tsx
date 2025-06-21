
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, Database, Upload, Clock, Link, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const navigate = useNavigate();

  const handleArchive = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to archive",
        variant: "destructive"
      });
      return;
    }

    setIsArchiving(true);
    
    // Simulate archiving process
    setTimeout(() => {
      setIsArchiving(false);
      toast({
        title: "Archive Created",
        description: `Successfully archived ${url}`,
      });
      navigate(`/browse?url=${encodeURIComponent(url)}`);
    }, 2000);
  };

  const handleSearch = () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to search archives",
        variant: "destructive"
      });
      return;
    }
    navigate(`/browse?url=${encodeURIComponent(url)}`);
  };

  const recentArchives = [
    {
      url: "https://example.com",
      timestamp: "2024-06-21T10:30:00Z",
      size: "2.4 MB",
      status: "completed"
    },
    {
      url: "https://news.example.org",
      timestamp: "2024-06-21T09:15:00Z",
      size: "1.8 MB",
      status: "completed"
    },
    {
      url: "https://blog.example.net",
      timestamp: "2024-06-21T08:45:00Z",
      size: "3.1 MB",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Web Archive Nexus</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/browse")}>
                Browse Archives
              </Button>
              <Button variant="ghost" onClick={() => navigate("/api-docs")}>
                API
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Preserve the Web,<br />
            <span className="text-blue-600">One Snapshot at a Time</span>
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Archive websites with full fidelity including HTML, CSS, JavaScript, and all assets. 
            Browse historical versions and never lose important web content again.
          </p>

          {/* Archive Input */}
          <Card className="max-w-2xl mx-auto mb-16 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Archive a Website
              </CardTitle>
              <CardDescription>
                Enter a URL to create a complete snapshot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleArchive()}
                />
                <Button 
                  onClick={handleArchive} 
                  disabled={isArchiving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isArchiving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSearch}
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Archives
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Complete Preservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Capture full websites including HTML, CSS, JavaScript, images, and all linked assets
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Timeline Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Browse through historical versions with an intuitive timeline interface
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Link className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>REST API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Programmatic access to archive and retrieve snapshots via comprehensive API
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Archives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Recent Archives
              </CardTitle>
              <CardDescription>
                Latest snapshots from the archive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentArchives.map((archive, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Archive className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900">{archive.url}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(archive.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{archive.size}</Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {archive.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Archive className="h-6 w-6" />
                <span className="font-bold">Web Archive Nexus</span>
              </div>
              <p className="text-slate-400">
                Preserving the web for future generations with complete fidelity and easy access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Website Snapshots</li>
                <li>Timeline Navigation</li>
                <li>Asset Preservation</li>
                <li>REST API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-slate-400">
                <li>FastAPI Backend</li>
                <li>Playwright Engine</li>
                <li>PostgreSQL Database</li>
                <li>Redis Caching</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li>API Documentation</li>
                <li>Usage Guide</li>
                <li>Developer Tools</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Web Archive Nexus. Built with modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
