"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  BookOpen,
  Target
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Study Group Maker</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#community" className="hover:text-foreground transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-6 py-1 px-4 text-sm bg-primary/10 text-primary border-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            AI-Powered Study Matchmaking
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Find Your Perfect <br /> Study Tribe.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            Stop studying alone. Connect with peers who share your major, skills, and goals. 
            Accelerate your learning with AI-driven study group matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-2xl shadow-primary/30">
                Start Matching Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border/50 bg-background/50 backdrop-blur-sm">
              Explore Groups
            </Button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-border/40 animate-in fade-in duration-1000 delay-500">
            <div>
              <div className="text-3xl font-bold mb-1">2k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Groups</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">150+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Majors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">4.9/5</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to succeed.</h2>
            <p className="text-muted-foreground text-lg">Designed for students, powered by intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/40 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="pt-8 px-8 pb-10">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
                <p className="text-muted-foreground">Our smart algorithms analyze your profile to find study mates who complement your skills perfectly.</p>
              </CardContent>
            </Card>

            <Card className="bg-background/40 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="pt-8 px-8 pb-10">
                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Collaboration</h3>
                <p className="text-muted-foreground">Join groups instantly and start chatting. Share resources, ask questions, and grow together in real-time.</p>
              </CardContent>
            </Card>

            <Card className="bg-background/40 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardContent className="pt-8 px-8 pb-10">
                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Goal-Oriented</h3>
                <p className="text-muted-foreground">Set milestones for your study groups. Track progress and keep everyone motivated on the path to success.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 italic tracking-tighter">
            Ready to level up your <br /> academic journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of students who are already studying smarter, not harder. 
            Sign up today and find your perfect match.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/40 rounded-full group">
              Get Started Now
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">AI Study Group Maker</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 AI Study Group Maker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

