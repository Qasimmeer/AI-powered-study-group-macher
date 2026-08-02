"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Filter, 
  ChevronRight,
  UserCheck,
  UserPlus,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Group {
  id: number;
  name: string;
  topic: string;
  description: string;
  creatorId: number;
  isJoined: boolean;
  _count: {
    members: number;
  };
}

export default function MyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, created, joined
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", topic: "" });
  const [creating, setCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const profileRes = await fetch("/api/user/profile");
      const profile = await profileRes.json();

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGroup, major: profile.major }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setNewGroup({ name: "", description: "", topic: "" });
        router.push(`/groups/${data.group.id}`);
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setCreating(false);
    }
  };

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups?search=${encodeURIComponent(search)}&filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleJoinGroup = async (groupId: number) => {
    setJoiningId(groupId);
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
      if (res.ok) {
        // Refresh local state instead of full fetch for smoother UI
        setGroups(prev => prev.map(g => 
          g.id === groupId ? { ...g, isJoined: true, _count: { ...g._count, members: g._count.members + 1 } } : g
        ));
        router.push(`/groups/${groupId}`);
      }
    } catch (err) {
      console.error("Failed to join group:", err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Section */}
          <header className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Study Groups
                </h1>
                <p className="text-muted-foreground text-lg font-medium">
                  Find your community and learn together.
                </p>
              </div>
              <Button 
                size="lg" 
                className="gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-5 w-5" />
                Create New Group
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-2 rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 shadow-sm">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search by group name or topic..." 
                  className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground/60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl">
                {[
                  { id: "all", label: "All Groups" },
                  { id: "joined", label: "My Groups" },
                  { id: "created", label: "Created By Me" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                      filter === f.id 
                        ? "bg-primary text-primary-foreground shadow-md scale-105" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border/40 bg-card/40 animate-pulse h-[220px]" />
              ))
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <Card 
                  key={group.id} 
                  className="group border-border/40 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer flex flex-col"
                  onClick={() => group.isJoined && router.push(`/groups/${group.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110 duration-300">
                        <Users className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold tracking-wider px-2 py-0.5">
                        {group.topic}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px] text-muted-foreground/80 font-medium">
                      {group.description || "Join this group to collaborate and share resources with other students."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-semibold">
                        <Users className="h-4 w-4" />
                        <span>{group._count.members} members</span>
                      </div>
                      <Button
                        size="sm"
                        variant={group.isJoined ? "secondary" : "default"}
                        className={cn(
                          "gap-2 font-bold px-4 transition-all active:scale-95",
                          group.isJoined ? "bg-secondary/30 hover:bg-secondary/50" : "shadow-lg shadow-primary/10"
                        )}
                        disabled={joiningId === group.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!group.isJoined) handleJoinGroup(group.id);
                          else router.push(`/groups/${group.id}`);
                        }}
                      >
                        {joiningId === group.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : group.isJoined ? (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Open
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Join
                          </>
                        )}
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
                <h3 className="text-2xl font-bold">No groups found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setFilter("all"); }}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg border-border/50 bg-card shadow-2xl shadow-primary/10 animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-2xl">Create Study Group</CardTitle>
              <CardDescription>Start a community for your study topic.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateGroup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold ml-1">Group Name</label>
                  <Input
                    id="name"
                    placeholder="e.g. Advanced AI Explorers"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                    className="h-11 bg-muted/20 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="topic" className="text-sm font-semibold ml-1">Primary Topic</label>
                  <Input
                    id="topic"
                    placeholder="e.g. Deep Learning"
                    value={newGroup.topic}
                    onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                    required
                    className="h-11 bg-muted/20 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="desc" className="text-sm font-semibold ml-1">Description (Optional)</label>
                  <Input
                    id="desc"
                    placeholder="What is this group about?"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="h-11 bg-muted/20 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 px-6 font-semibold"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 px-8 font-bold shadow-lg shadow-primary/20"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create Group"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
