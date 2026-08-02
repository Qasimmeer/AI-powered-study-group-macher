"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  BookOpen,
  Plus,
  Sparkles,
  MessageSquare,
  Clock,
  Zap,
  Globe,
  TrendingUp,
  Check,
  BrainCircuit,
  Bell,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher-client";

interface RecommendationUser {
  id: number;
  username: string;
  major: string;
  level: string;
  skills: string[];
}

interface RecommendationGroup {
  id: number;
  name: string;
  topic: string;
  hoursStudied: number;
  activityLevel: string;
  _count: {
    members: number;
  };
}

interface Stats {
  totalUsers: number;
  totalGroups: number;
  totalStudyHours: number;
  activeSessions: number;
}

interface HomeClientProps {
  initialData: {
    users: RecommendationUser[];
    groups: RecommendationGroup[];
    currentUserMajor?: string;
    joinedGroupIds?: number[];
    stats?: Stats;
  };
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState(initialData);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", topic: "" });
  const [creating, setCreating] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<RecommendationUser | null>(null);
  const [inviteData, setInviteData] = useState({ name: "", topic: "" });
  const [inviting, setInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [handlingInviteId, setHandlingInviteId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvites();
    const setupPusher = async () => {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const profile = await res.json();
        const channel = pusherClient.subscribe(`user-${profile.id}`);
        channel.bind("group-invite", (invite: any) => {
          setPendingInvites(prev => [invite, ...prev]);
          toast.info(`New study invite from ${invite.sender.username}!`);
        });
        channel.bind("invite-accepted", (data: any) => {
          toast.success(`${data.receiverName} accepted your invite!`);
          router.push(`/groups/${data.groupId}`);
        });
        return () => pusherClient.unsubscribe(`user-${profile.id}`);
      }
    };
    setupPusher();
  }, []);

  const fetchInvites = async () => {
    const res = await fetch("/api/invites");
    if (res.ok) {
      const data = await res.json();
      setPendingInvites(data);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGroup, major: recommendations.currentUserMajor }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(prev => ({
          ...prev,
          groups: [data.group, ...prev.groups].slice(0, 5),
          joinedGroupIds: [...(prev.joinedGroupIds || []), data.group.id],
        }));
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

  const handleJoinGroup = async (groupId: number) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
      if (res.ok) {
        setRecommendations(prev => ({
          ...prev,
          joinedGroupIds: [...(prev.joinedGroupIds || []), groupId],
        }));
        router.push(`/groups/${groupId}`);
      }
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };



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

  const handleInviteAction = async (inviteId: number, action: "ACCEPT" | "REJECT") => {
    setHandlingInviteId(inviteId);
    try {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        if (action === "ACCEPT") {
          toast.success("Joined the new group!");
          router.push(`/groups/${data.groupId}`);
        } else {
          toast.info("Invite declined");
        }
      }
    } catch (err) {
      console.error("Handle invite error:", err);
      toast.error("Action failed");
    } finally {
      setHandlingInviteId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <header className="flex items-center justify-between p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/30 border border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-colors duration-700" />
            
            <div className="space-y-2 relative z-10">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-lg font-medium">Your study ecosystem is thriving. Here&apos;s the latest.</p>
            </div>
            <Button
              size="lg"
              className="relative z-10 gap-2 h-14 px-8 rounded-2xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-5 w-5" />
              Create Group
            </Button>
          </header>

          {/* Stats Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl group hover:border-blue-500/50 transition-all duration-500 rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Total Learners</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">{recommendations.stats?.totalUsers.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 uppercase tracking-tighter">+12% growth</span>
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl group hover:border-purple-500/50 transition-all duration-500 rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Study Groups</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Globe className="w-4 h-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">{recommendations.stats?.totalGroups.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tighter font-bold">Active communities</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl group hover:border-orange-500/50 transition-all duration-500 rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Hours Focused</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">{recommendations.stats?.totalStudyHours.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tighter font-bold">Focus time</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur-xl group hover:border-green-500/50 transition-all duration-500 rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Live Now</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-green-500 fill-green-500 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">{recommendations.stats?.activeSessions.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tighter font-bold">Live sessions</p>
              </CardContent>
            </Card>
          </section>

          {/* Smart Recommendations Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-primary">
                  <BrainCircuit className="h-8 w-8 animate-pulse" />
                  Smart Recommendations
                </h2>
                <p className="text-muted-foreground">AI-powered matches based on your major and skills.</p>
              </div>
            </div>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                {pendingInvites.map(invite => (
                  <Card key={invite.id} className="border-primary bg-primary/5 shadow-xl shadow-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest mb-1">
                        <Bell className="h-3 w-3" /> Incoming Invite
                      </div>
                      <CardTitle className="text-lg">{invite.groupName}</CardTitle>
                      <CardDescription className="text-xs">
                        From <span className="font-bold text-foreground">{invite.sender.username}</span> &bull; {invite.groupTopic}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 rounded-lg" 
                        onClick={() => handleInviteAction(invite.id, "ACCEPT")}
                        disabled={handlingInviteId === invite.id}
                      >
                        {handlingInviteId === invite.id ? (
                          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : "Accept"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 rounded-lg" 
                        onClick={() => handleInviteAction(invite.id, "REJECT")}
                        disabled={handlingInviteId === invite.id}
                      >
                        Reject
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* User Match Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations?.users?.length > 0 ? (
                recommendations.users.map(user => {
                  const isMajorMatch = user.major === recommendations.currentUserMajor;
                  return (
                    <Card
                      key={user.id}
                      className="border-white/5 bg-card/40 backdrop-blur-xl hover:bg-card/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(var(--primary),0.1)] group relative overflow-hidden rounded-3xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 group-hover:bg-primary/20 transition-all duration-700 blur-2xl" />
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-2xl shadow-inner relative group-hover:scale-110 transition-transform duration-500">
                            {user.username[0].toUpperCase()}
                            {isMajorMatch && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-card flex items-center justify-center" title="Major Match">
                                <Check className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-xl truncate tracking-tight">{user.username}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[9px] h-5 bg-white/5 border-white/5 text-muted-foreground uppercase font-black">
                                {user.level}
                              </Badge>
                              {isMajorMatch && (
                                <Badge className="text-[9px] h-5 bg-green-500/20 text-green-400 border-green-500/20 uppercase font-black tracking-tighter">
                                  BEST MATCH
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {user.major}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(user.skills || []).slice(0, 3).map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground border border-border/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full gap-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5"
                          onClick={() => setInviteTarget(user)}
                        >
                          <Handshake className="h-4 w-4" />
                          Invite to Group
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-muted-foreground italic col-span-full text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/40">
                  Scanning for potential matches... Check back shortly.
                </p>
              )}
            </div>
          </section>

          {/* Active Study Groups Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="h-7 w-7 text-secondary" />
                Active Study Groups
              </h2>
              <Button variant="ghost" size="sm" className="gap-2">
                Explore All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations?.groups?.length > 0 ? (
                recommendations.groups.map(group => (
                  <Card
                    key={group.id}
                    className="border-border/40 bg-card/40 hover:bg-card/60 transition-all cursor-pointer group"
                    onClick={() => recommendations.joinedGroupIds?.includes(group.id) && router.push(`/groups/${group.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                        <MessageSquare className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-lg flex items-center gap-2">
                          {group.name}
                          {group.activityLevel === "High" && (
                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[8px] h-4">HOT</Badge>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold">{group.topic}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {group._count.members}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {group.hoursStudied}h
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={recommendations.joinedGroupIds?.includes(group.id) ? "secondary" : "ghost"}
                        onClick={e => {
                          e.stopPropagation();
                          if (!recommendations.joinedGroupIds?.includes(group.id)) {
                            handleJoinGroup(group.id);
                          }
                        }}
                        disabled={recommendations.joinedGroupIds?.includes(group.id)}
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        {recommendations.joinedGroupIds?.includes(group.id)
                          ? "Joined"
                          : "Join"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border/60 bg-transparent col-span-full">
                  <CardContent className="p-8 text-center space-y-4">
                    <p className="text-muted-foreground italic">No groups found in your major yet.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                      Create the first one!
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

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
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Advanced AI Explorers"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                    className="bg-background/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Primary Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Deep Learning"
                    value={newGroup.topic}
                    onChange={e => setNewGroup({ ...newGroup, topic: e.target.value })}
                    required
                    className="bg-background/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Input
                    id="desc"
                    placeholder="What is this group about?"
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="bg-background/40"
                  />
                </div>

              </CardContent>
              <div className="p-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" className="h-11 px-6 hover:bg-muted" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-8 shadow-lg shadow-primary/20" disabled={creating}>
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
