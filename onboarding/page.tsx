"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { MAJOR_DATA, MAJORS, LEVELS } from "@/lib/constants";

export default function OnboardingPage() {
  const [major, setMajor] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [studyTopic, setStudyTopic] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleMajorChange = (newMajor: string) => {
    setMajor(newMajor);
    setLanguage("");
    setStudyTopic("");
    setSkills([]);
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
  };

  const handleKeyPressSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      handleAddSkill(skillInput.trim());
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major,
          languages: language ? [language] : [],
          level,
          studyTopic,
          skills
        }),
      });

      if (res.ok) {
        router.push("/home");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save onboarding data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--primary)_0%,transparent_100%)] opacity-[0.03]" />

      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-2xl shadow-xl">
        <CardHeader className="space-y-3 pb-8">
          <CardTitle className="text-4xl font-bold tracking-tight">Complete your profile</CardTitle>
          <CardDescription className="text-lg">
            Help us find the best study groups for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium">Major</Label>
                <Select<string> onValueChange={(val) => handleMajorChange(val ?? "")} required>
                  <SelectTrigger className="h-11 bg-background/40 transition-all focus:bg-background/80">
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJORS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">Primary Language</Label>
                <Select<string> 
                  onValueChange={(val) => setLanguage(val ?? "")} 
                  required 
                  disabled={!major}
                  value={language}
                >
                  <SelectTrigger className="h-11 bg-background/40 transition-all focus:bg-background/80">
                    <SelectValue placeholder={major ? "Select language" : "Select major first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {major && MAJOR_DATA[major as keyof typeof MAJOR_DATA].languages.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">Level</Label>
                <Select<string> onValueChange={(val) => setLevel(val ?? "")} required>
                  <SelectTrigger className="h-11 bg-background/40 transition-all focus:bg-background/80">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((lev) => (
                      <SelectItem key={lev} value={lev}>{lev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="studyTopic" className="text-sm font-medium">Study Topic</Label>
                {major ? (
                  <Select<string> onValueChange={(val) => setStudyTopic(val ?? "")} required value={studyTopic}>
                    <SelectTrigger className="h-11 bg-background/40 transition-all focus:bg-background/80">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJOR_DATA[major as keyof typeof MAJOR_DATA].topics.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="studyTopic"
                    placeholder="Select major first"
                    disabled
                    className="h-11 bg-background/40"
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Skills</Label>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Suggested for {major || 'you'}</span>
              </div>
              
              {major && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {MAJOR_DATA[major as keyof typeof MAJOR_DATA].skills.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`rounded-full h-8 px-4 text-xs transition-all ${skills.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'}`}
                      onClick={() => skills.includes(s) ? removeSkill(s) : handleAddSkill(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}

              <Input
                placeholder="Add custom skill and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyPressSkill}
                className="h-11 bg-background/40 transition-all focus:bg-background/80"
              />
              <div className="flex flex-wrap gap-2.5 min-h-[40px]">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-1.5 bg-primary/10 text-primary border-primary/20 transition-all hover:bg-primary/20">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No skills added yet</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Saving Profile..." : "Finish Onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
