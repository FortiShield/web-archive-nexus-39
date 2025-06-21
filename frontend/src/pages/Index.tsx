import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Archive, Search, Globe, History, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [domain, setDomain] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to search archives",
        variant: "destructive",
      });
      return;
    }

    // Clean domain input (remove protocol, www, trailing slashes)
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    navigate(`/archive/${encodeURIComponent(cleanDomain)}`);
  };

  const exampleDomains = [
    "example.com",
    "github.com",
    "stackoverflow.com",
    "wikipedia.org",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Web Archive Browser
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate("/browse")}>
                Browse
              </Button>
              <Button variant="ghost" onClick={() => navigate("/api-docs")}>
                API
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Explore the
            <span className="text-primary block">Archived Web</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Search and browse historical snapshots of websites. Travel back in
            time to see how websites looked and what content they had at any
            point in history.
          </p>

          {/* Search Input */}
          <Card className="max-w-2xl mx-auto mb-16 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Archives
              </CardTitle>
              <CardDescription>
                Enter a domain name to find its archived snapshots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Example domains */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground">Try:</span>
                {exampleDomains.map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setDomain(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <History className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Time Travel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse historical versions of websites and see how they
                  evolved over time
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Complete Snapshots</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View full page snapshots including HTML, CSS, and JavaScript
                  as they appeared
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Searchable Archive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fast search across millions of archived pages with timeline
                  navigation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>
                Simple steps to explore archived websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Enter Domain</h3>
                    <p className="text-sm text-muted-foreground">
                      Type any website domain to search for archived versions
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Browse Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                      View all available snapshots organized by date and time
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">View Snapshot</h3>
                    <p className="text-sm text-muted-foreground">
                      Click any snapshot to view the archived page as it
                      appeared
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Archive className="h-6 w-6 text-primary" />
                <span className="font-bold">Web Archive Browser</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Exploring the archived web, one snapshot at a time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Timeline Navigation</li>
                <li>Full Page Snapshots</li>
                <li>Search Archives</li>
                <li>Historical Browsing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Responsive Design</li>
                <li>Dark/Light Theme</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>API Documentation</li>
                <li>Search Help</li>
                <li>Browse Archives</li>
                <li>About Project</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 Web Archive Browser. Built with React and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
