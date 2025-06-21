import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, ArrowLeft, Code, Database, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApiDocs = () => {
  const navigate = useNavigate();

  const endpoints = [
    {
      method: "POST",
      path: "/api/archive",
      description: "Create a new website archive",
      parameters: [
        {
          name: "url",
          type: "string",
          required: true,
          description: "The URL to archive",
        },
        {
          name: "options",
          type: "object",
          required: false,
          description: "Archive options (depth, wait_time, etc.)",
        },
      ],
      response: {
        id: "archive_123",
        url: "https://example.com",
        status: "pending",
        created_at: "2024-06-21T10:30:00Z",
      },
    },
    {
      method: "GET",
      path: "/api/archive/{id}",
      description: "Get archive status and metadata",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "Archive ID",
        },
      ],
      response: {
        id: "archive_123",
        url: "https://example.com",
        status: "completed",
        size: "2.4MB",
        created_at: "2024-06-21T10:30:00Z",
        completed_at: "2024-06-21T10:32:15Z",
      },
    },
    {
      method: "GET",
      path: "/api/search",
      description: "Search archived snapshots",
      parameters: [
        {
          name: "url",
          type: "string",
          required: true,
          description: "URL to search for",
        },
        {
          name: "from_date",
          type: "string",
          required: false,
          description: "Start date (ISO format)",
        },
        {
          name: "to_date",
          type: "string",
          required: false,
          description: "End date (ISO format)",
        },
      ],
      response: {
        snapshots: [
          {
            id: "archive_123",
            url: "https://example.com",
            timestamp: "2024-06-21T10:30:00Z",
            size: "2.4MB",
          },
        ],
        total: 1,
      },
    },
    {
      method: "GET",
      path: "/api/snapshot/{id}",
      description: "Retrieve archived snapshot content",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "Snapshot ID",
        },
      ],
      response:
        "Returns the archived HTML content with all assets embedded or referenced",
    },
  ];

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
              <Code className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">
                API Documentation
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-6 w-6" />
              Web Archive Nexus API
            </CardTitle>
            <CardDescription>
              RESTful API for programmatic access to web archiving capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="bg-slate-100 px-3 py-1 rounded text-sm">
                https://api.webarchive.nexus
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-slate-600">
                Include your API key in the Authorization header:
              </p>
              <code className="bg-slate-100 px-3 py-1 rounded text-sm block mt-2">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rate Limits</h3>
              <p className="text-slate-600">
                100 requests per minute for free tier, 1000 for premium accounts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">API Endpoints</h2>

          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      endpoint.method === "GET" ? "secondary" : "default"
                    }
                    className={endpoint.method === "POST" ? "bg-green-600" : ""}
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-lg font-mono">{endpoint.path}</code>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parameters */}
                <div>
                  <h4 className="font-semibold mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, paramIndex) => (
                      <div
                        key={paramIndex}
                        className="flex items-start gap-4 p-3 bg-slate-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">
                            {param.name}
                          </code>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">
                              required
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-600 mb-1">
                            Type: <code>{param.type}</code>
                          </div>
                          <div className="text-sm text-slate-800">
                            {param.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-semibold mb-3">Response Example</h4>
                  <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                    {typeof endpoint.response === "string"
                      ? endpoint.response
                      : JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SDK Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              SDK Examples
            </CardTitle>
            <CardDescription>
              Quick start examples in popular programming languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Python</h4>
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                {`import requests

# Archive a website
response = requests.post(
    'https://api.webarchive.nexus/api/archive',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'url': 'https://example.com'}
)

archive_id = response.json()['id']
print(f"Archive created: {archive_id}")`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-3">JavaScript</h4>
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                {`// Archive a website
const response = await fetch('https://api.webarchive.nexus/api/archive', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();
console.log('Archive created:', result.id);`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-3">cURL</h4>
              <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                {`curl -X POST https://api.webarchive.nexus/api/archive \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Error Codes</CardTitle>
            <CardDescription>
              Common HTTP status codes and their meanings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  code: 200,
                  description: "Success - Request completed successfully",
                },
                {
                  code: 400,
                  description:
                    "Bad Request - Invalid parameters or malformed request",
                },
                {
                  code: 401,
                  description: "Unauthorized - Invalid or missing API key",
                },
                {
                  code: 404,
                  description: "Not Found - Archive or resource not found",
                },
                {
                  code: 429,
                  description:
                    "Rate Limited - Too many requests, please slow down",
                },
                {
                  code: 500,
                  description: "Server Error - Internal server error occurred",
                },
              ].map((error, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border border-slate-200 rounded"
                >
                  <Badge
                    variant={error.code < 400 ? "secondary" : "destructive"}
                  >
                    {error.code}
                  </Badge>
                  <span className="text-slate-800">{error.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
