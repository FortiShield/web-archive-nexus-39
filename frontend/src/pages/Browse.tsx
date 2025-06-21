import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Archive,
  Search,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchUrl, setSearchUrl] = useState(searchParams.get("url") || "");
  const [selectedYear, setSelectedYear] = useState("2024");

  const snapshots = [
    {
      timestamp: "2024-06-21T10:30:00Z",
      size: "2.4 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
    {
      timestamp: "2024-06-15T14:22:00Z",
      size: "2.1 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
    {
      timestamp: "2024-06-10T09:15:00Z",
      size: "1.9 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
    {
      timestamp: "2024-06-05T16:45:00Z",
      size: "2.0 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
    {
      timestamp: "2024-05-28T11:30:00Z",
      size: "1.8 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
    {
      timestamp: "2024-05-20T13:12:00Z",
      size: "2.2 MB",
      status: "completed",
      title: "Homepage - Example.com",
      preview: "/placeholder.svg",
    },
  ];

  const years = ["2024", "2023", "2022", "2021"];

  const handleSearch = () => {
    if (!searchUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to search",
        variant: "destructive",
      });
      return;
    }
    // Update URL params and refresh results
    navigate(`/browse?url=${encodeURIComponent(searchUrl)}`);
  };

  const handleViewSnapshot = (snapshot: any) => {
    toast({
      title: "Opening Snapshot",
      description: `Viewing archived version from ${new Date(snapshot.timestamp).toLocaleDateString()}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Archive className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">
                Browse Archives
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Archives
            </CardTitle>
            <CardDescription>
              Find historical snapshots of any website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchUrl && (
          <>
            {/* Timeline Navigation */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline for {searchUrl}
                </CardTitle>
                <CardDescription>Browse snapshots by year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {years.map((year) => (
                    <Button
                      key={year}
                      variant={selectedYear === year ? "default" : "outline"}
                      onClick={() => setSelectedYear(year)}
                      className={
                        selectedYear === year
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Snapshots Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Snapshots from {selectedYear}
                </h2>
                <Badge variant="secondary" className="text-sm">
                  {snapshots.length} snapshots found
                </Badge>
              </div>

              <div className="grid gap-6">
                {snapshots.map((snapshot, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewSnapshot(snapshot)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <img
                            src={snapshot.preview}
                            alt="Snapshot preview"
                            className="w-32 h-24 object-cover rounded border border-slate-200"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900 mb-2">
                                {snapshot.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    snapshot.timestamp,
                                  ).toLocaleString()}
                                </div>
                                <Badge variant="secondary">
                                  {snapshot.size}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800">
                                  {snapshot.status}
                                </Badge>
                              </div>
                              <p className="text-slate-600 text-sm">
                                Archived snapshot containing full page content,
                                styles, and assets
                              </p>
                            </div>
                            <Button size="sm" className="ml-4">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {snapshots.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No snapshots found
                    </h3>
                    <p className="text-slate-600 mb-6">
                      No archived versions found for this URL in {selectedYear}
                    </p>
                    <Button
                      onClick={() => navigate("/")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Archive This Site
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {!searchUrl && (
          <Card className="text-center py-16">
            <CardContent>
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Search the Archive
              </h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Enter a URL above to find all archived snapshots and browse
                through their timeline
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Browse;
