"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher-client";
import { IoSend } from "react-icons/io5";
import { 
  ArrowLeft, 
  MessageSquare, 
  Info, 
  Users, 
  FileText, 
  Download, 
  Plus, 
  FileIcon,
  X
} from "lucide-react";
import Uploader from "@/components/resources/Uploader";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: { username: string };
  createdAt: string;
}

interface GroupFile {
  id: number;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  createdAt: string;
  user: { username: string };
}

interface Group {
  id: number;
  name: string;
  topic: string;
  creatorId: number;
  members: { id: number, username: string, major: string }[];
  messages: Message[];
  files: GroupFile[];
}



export default function GroupChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GroupFile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`/api/groups/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGroup(data);
          
          const profileRes = await fetch("/api/user/profile");
          const profileData = await profileRes.json();
          setUserId(profileData.id);

        } else {
          router.push("/home");
        }
      } catch (err) {
        console.error("Failed to fetch group:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();

    // Subscribe to Pusher
    const channel = pusherClient.subscribe(`group-${id}`);
    
    channel.bind("new-message", (newMessage: Message) => {
      setGroup(prev => {
        if (!prev) return null;
        if (prev.messages.find(m => m.id === newMessage.id)) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage]
        };
      });
    });

    channel.bind("new-file", (newFile: GroupFile) => {
      setGroup(prev => {
        if (!prev) return null;
        if (prev.files.find(f => f.id === newFile.id)) return prev;
        return {
          ...prev,
          files: [newFile, ...prev.files]
        };
      });
      toast.info(`New file shared: ${newFile.name}`);
    });

    return () => {
      pusherClient.unsubscribe(`group-${id}`);
    };
  }, [id, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [group?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/groups/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: message,
          socketId: pusherClient.connection.socket_id 
        }),
      });
      if (res.ok) {
        const newMessage = await res.json();
        setGroup(prev => {
          if (!prev) return null;
          // Prevent duplication if Pusher already added it
          if (prev.messages.find(m => m.id === newMessage.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (fileData: any) => {
    try {
      const res = await fetch(`/api/groups/${id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fileData,
          socketId: pusherClient.connection.socket_id
        }),
      });

      if (res.ok) {
        const newFile = await res.json();
        setGroup(prev => {
          if (!prev) return null;
          if (prev.files.find(f => f.id === newFile.id)) return prev;
          return {
            ...prev,
            files: [newFile, ...prev.files]
          };
        });
        setShowUploader(false);
      }
    } catch (err) {
      console.error("Failed to upload group file:", err);
      toast.error("Failed to share file");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-20 border-b border-border/40 bg-card/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                {group.name}
                <Badge className="text-[9px] h-5 bg-primary/20 text-primary border-primary/20 uppercase font-black tracking-widest">{group.topic}</Badge>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1">
                <Users className="h-3 w-3" />
                {group.members.length} active learners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-300">
               <Info className="h-5 w-5" />
             </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
            >
              {group.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                </div>
              ) : (
                group.messages
                  .map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div key={msg.id} className={cn("flex flex-col group/msg", isMe ? "items-end" : "items-start")}>
                        {!isMe && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-2 mb-1">
                            {msg.sender.username}
                          </span>
                        )}
                        <div className={cn(
                          "max-w-[75%] px-5 py-3 rounded-2xl text-sm shadow-xl transition-all duration-300",
                          isMe 
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-none shadow-primary/20" 
                            : "bg-card/50 border border-white/5 rounded-tl-none backdrop-blur-md"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground mt-1.5 px-2 opacity-0 group-hover/msg:opacity-100 transition-opacity uppercase tracking-tighter">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
            <div className="p-6 bg-background/50 backdrop-blur-md border-t border-border/10">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                <div className="flex-1 relative group">
                  <Input 
                    placeholder="Type a message..." 
                    className="h-14 pl-6 pr-16 bg-card/50 border-border/20 focus:bg-card focus:border-primary/50 transition-all rounded-2xl shadow-inner backdrop-blur-sm"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!message.trim() || sending}
                    className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-110 hover:shadow-primary/40 active:scale-95 transition-all duration-300"
                  >
                    <IoSend className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="w-80 border-l border-border/40 bg-card/10 backdrop-blur-sm hidden lg:flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-10">

              {/* Members Section */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 opacity-70">
                  <Users className="h-3 w-3" />
                  Members • {group.members.length}
                </h3>
                <div className="space-y-4">
                  {group.members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 group/member cursor-default">
                      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary group-hover/member:bg-primary group-hover/member:text-primary-foreground transition-all duration-500 shadow-inner">
                        {member.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover/member:text-primary transition-colors tracking-tight">{member.username}</p>
                        <p className="text-[9px] text-muted-foreground truncate uppercase tracking-widest font-black opacity-70">{member.major}</p>
                      </div>
                      {member.id === group.members[0].id && (
                        <Badge className="h-4 text-[7px] bg-primary/20 text-primary border-primary/20 uppercase font-black tracking-widest">Admin</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Files Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 opacity-70">
                    <FileText className="h-3 w-3" />
                    Shared Files
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setShowUploader(!showUploader)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {showUploader && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-2 duration-200">
                    <Uploader onUploadSuccess={handleFileUpload} />
                  </div>
                )}

                <div className="space-y-3">
                  {group.files?.length > 0 ? (
                    group.files.map(file => (
                      <div 
                        key={file.id} 
                        className="p-3 rounded-xl bg-card/40 border border-border/20 hover:border-primary/30 hover:bg-card/60 transition-all cursor-pointer group/file"
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover/file:bg-primary/10 group-hover/file:text-primary transition-colors">
                            <FileIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate pr-4">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-muted-foreground uppercase">{file.user.username}</span>
                              <span className="text-[9px] text-muted-foreground">•</span>
                              <span className="text-[9px] text-muted-foreground uppercase">{format(new Date(file.createdAt), "MMM d")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-border/40">
                      <p className="text-[11px] text-muted-foreground italic">No files shared yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl h-[85vh] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Viewer Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[300px]">{selectedFile.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Shared by {selectedFile.user.username} • {selectedFile.type || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={selectedFile.url} download={selectedFile.name} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-black/5 flex items-center justify-center overflow-hidden">
              {selectedFile.type?.startsWith("image/") ? (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                  />
                </div>
              ) : selectedFile.type?.includes("pdf") ? (
                <iframe 
                  src={`${selectedFile.url}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={selectedFile.name}
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
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer">
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
