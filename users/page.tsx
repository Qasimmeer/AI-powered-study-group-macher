"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users as UsersIcon, 
  Search, 
  MessageSquare, 
  MapPin, 
  BookOpen,
  GraduationCap,
  Sparkles,
  UserPlus,
  Handshake,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface UserProfile {
  id: number;
  username: string;
  name: string;
  major: string;
  level: string;
  studyTopic: string;
  skills: string[];
}

export default function UsersSearchPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inviteTarget, setInviteTarget] = useState<UserProfile | null>(null);
  const [inviteData, setInviteData] = useState({ name: "", topic: "" });
  const [inviting, setInviting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTarget) return;
    setInviting(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: inviteTarget.id,
          groupName: inviteData.name,
          groupTopic: inviteData.topic,
        }),
      });
      if (res.ok) {
        toast.success(`Invite sent to ${inviteTarget.username}!`);
        setInviteTarget(null);
        setInviteData({ name: "", topic: "" });
      }
    } catch (err) {
      console.error("Invite error:", err);
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Section */}
          <header className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Find Study Partners
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                Connect with students who share your interests and expertise.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex p-2 rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 shadow-sm">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search by username, major, or topic..." 
                  className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground/60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border/40 bg-card/40 animate-pulse h-[260px]" />
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <Card 
                  key={user.id} 
                  className="group border-border/40 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  <CardHeader className="pb-3 flex-row items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold transition-transform group-hover:scale-110 duration-300 shadow-inner">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                          {user.username}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1 font-semibold text-primary/80">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {user.major}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <BookOpen className="h-3 w-3" />
                        Focusing On
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{user.studyTopic || "General Studies"}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {user.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-secondary/20 hover:bg-secondary/30 text-[10px] py-0 px-2 font-bold">
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge variant="ghost" className="text-[10px] py-0 px-2 font-bold">+{user.skills.length - 3}</Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border/40 mt-4">
                      <Button 
                        className="flex-1 gap-2 font-bold shadow-lg shadow-primary/10 transition-all active:scale-95"
                        onClick={() => setInviteTarget(user)}
                      >
                        <Handshake className="h-4 w-4" />
                        Invite to Group
                      </Button>
                      <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/50 hover:bg-primary/5 hover:text-primary transition-colors">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/20 text-muted-foreground mb-4">
                  <Search className="h-10 w-10 opacity-20" />
                </div>
                <h3 className="text-2xl font-bold">No students found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try a different search term to find study partners.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearch("")}
                  className="mt-4"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {inviteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-primary/20 bg-card shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Handshake className="h-32 w-32 text-primary" />
            </div>
            <CardHeader className="relative">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Plus className="h-6 w-6 text-primary" />
                Invite {inviteTarget.username}
              </CardTitle>
              <CardDescription>Start a new study session with this match.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendInvite}>
              <CardContent className="space-y-6 relative">
                <div className="space-y-2">
                  <Label htmlFor="inv-name">Group Name</Label>
                  <Input
                    id="inv-name"
                    placeholder="e.g. Advanced Stats Study"
                    value={inviteData.name}
                    onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                    required
                    className="h-12 bg-muted/20 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-topic">Main Topic</Label>
                  <Input
                    id="inv-topic"
                    placeholder="e.g. Probability Theory"
                    value={inviteData.topic}
                    onChange={e => setInviteData({ ...inviteData, topic: e.target.value })}
                    required
                    className="h-12 bg-muted/20 border-border/50"
                  />
                </div>
              </CardContent>
              <div className="p-6 flex justify-end gap-3 relative bg-muted/5">
                <Button type="button" variant="ghost" onClick={() => setInviteTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-8 shadow-lg shadow-primary/20" disabled={inviting}>
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
