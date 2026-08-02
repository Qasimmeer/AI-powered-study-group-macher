"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookMarked, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  FileIcon,
  Loader2,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Uploader from "@/components/resources/Uploader";
import { toast } from "sonner";
import { format } from "date-fns";

interface Resource {
  id: number;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  createdAt: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);


  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (fileData: any) => {
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      });

      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data.resource, ...prev]);
        setShowUploader(false);
      }
    } catch (error) {
      console.error("Failed to save resource:", error);
      toast.error("Failed to save document metadata");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
        toast.success("Document deleted");
      }
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast.error("Failed to delete document");
    }
  };

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-3">
                <BookMarked className="h-10 w-10 text-primary" />
                Resources
              </h1>
              <p className="text-muted-foreground text-lg">Manage your personal study documents and notes.</p>
            </div>
            <Button 
              size="lg" 
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              onClick={() => setShowUploader(!showUploader)}
            >
              <Plus className="h-5 w-5" />
              {showUploader ? "Hide Uploader" : "Upload Document"}
            </Button>
          </header>

          {/* Uploader Section */}
          {showUploader && (
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm animate-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle>Add New Document</CardTitle>
                <CardDescription>Upload PDFs, images, or spreadsheets to your personal library.</CardDescription>
              </CardHeader>
              <CardContent>
                <Uploader onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-10 bg-card/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Document Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Scanning your library...</p>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="group border-border/50 bg-card/50 backdrop-blur-md hover:border-primary/50 transition-all duration-500 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg truncate" title={resource.name}>
                          {resource.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-medium tracking-wider">
                          <span>{resource.type?.split("/")[1] || "DOC"}</span>
                          <span>•</span>
                          <span>{formatSize(resource.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        ADDED {format(new Date(resource.createdAt), "MMM d, yyyy")}
                      </span>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary text-xs font-bold hover:underline"
                        onClick={() => setSelectedResource(resource)}
                      >
                        View Document
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/60 bg-transparent py-20 text-center">
              <CardContent className="space-y-6">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                  <FileIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">No documents yet</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {searchQuery 
                      ? `No documents found matching "${searchQuery}"` 
                      : "Start building your knowledge library by uploading your first document."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* File Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl h-[85vh] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Viewer Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[300px]">{selectedResource.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">{selectedResource.type || "Unknown Type"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={selectedResource.url} download={selectedResource.name} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => setSelectedResource(null)}>
                  Close
                </Button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-black/5 flex items-center justify-center overflow-hidden">
              {selectedResource.type?.startsWith("image/") ? (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <img 
                    src={selectedResource.url} 
                    alt={selectedResource.name} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                  />
                </div>
              ) : selectedResource.type?.includes("pdf") ? (
                <iframe 
                  src={`${selectedResource.url}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={selectedResource.name}
                />
              ) : (
                <div className="text-center space-y-6 p-10">
                  <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center mx-auto shadow-inner">
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">Preview not available</h4>
                    <p className="text-muted-foreground max-w-xs mx-auto">This file type cannot be previewed in the browser. Please download it to view the content.</p>
                  </div>
                  <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2 px-8">
                      <Download className="h-4 w-4" />
                      Download Now
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
