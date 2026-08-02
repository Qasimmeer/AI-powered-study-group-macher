"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save, User, Settings as SettingsIcon, Shield } from "lucide-react";
import { MAJOR_DATA, MAJORS, LEVELS } from "@/lib/constants";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    language: "",
    level: "",
    studyTopic: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            major: data.major || "",
            language: data.languages?.[0] || "",
            level: data.level || "",
            studyTopic: data.studyTopic || "",
            skills: data.skills || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          languages: [formData.language],
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account preferences and profile information.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Navigation Tabs (Vertical) */}
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start gap-3 h-12 rounded-xl">
                <User className="h-5 w-5" />
                Profile Info
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground">
                <Shield className="h-5 w-5" />
                Account & Security
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground">
                <SettingsIcon className="h-5 w-5" />
                Preferences
              </Button>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="space-y-6">
                <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>This information will be visible to potential study partners.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {message.text && (
                      <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {message.text}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-background/40"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Major</Label>
                        <Select<string> 
                          value={formData.major} 
                          onValueChange={(val) => setFormData({...formData, major: val ?? ""})}
                        >
                          <SelectTrigger className="bg-background/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAJORS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select<string> 
                          value={formData.level} 
                          onValueChange={(val) => setFormData({...formData, level: val ?? ""})}
                        >
                          <SelectTrigger className="bg-background/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Study Topic</Label>
                      <Select<string> 
                        value={formData.studyTopic} 
                        onValueChange={(val) => setFormData({...formData, studyTopic: val ?? ""})}
                        disabled={!formData.major}
                      >
                        <SelectTrigger className="bg-background/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.major && MAJOR_DATA[formData.major as keyof typeof MAJOR_DATA].topics.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 pt-2">
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.major && MAJOR_DATA[formData.major as keyof typeof MAJOR_DATA].skills.map(s => (
                          <Button
                            key={s}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`rounded-full h-8 px-4 text-xs ${formData.skills.includes(s) ? 'bg-primary text-primary-foreground' : ''}`}
                            onClick={() => formData.skills.includes(s) ? removeSkill(s) : handleAddSkill(s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add other skills..." 
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(skillInput))}
                          className="bg-background/40"
                        />
                        <Button type="button" onClick={() => handleAddSkill(skillInput)}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map(s => (
                          <Badge key={s} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-1.5 bg-primary/10 text-primary border-primary/20">
                            {s}
                            <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="gap-2 px-8 h-12 shadow-lg shadow-primary/20" disabled={saving}>
                    {saving ? "Saving Changes..." : (
                      <>
                        <Save className="h-5 w-5" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
