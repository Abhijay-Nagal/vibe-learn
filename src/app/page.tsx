"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Sparkles,
  PlayCircle,
  Target,
  ArrowRight,
  BookOpen,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const supabase = createClient();

  // View State Management
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Existing useEffect: Secure redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // ==========================================
  // 2. NEW useEffect: Auto-open auth modal if routed from sign-out
  // ==========================================
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#login') {
      setShowAuth(true);
      setIsLogin(true);
      
      // Clean up the URL hash so it looks clean in the browser
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (signUpError) throw signUpError;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Loading VibeLearn...
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: Authentication Form
  // ==========================================
  if (showAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-card/80 backdrop-blur-xl p-8 shadow-2xl border border-border relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center">
            <button onClick={() => setShowAuth(false)} className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              &larr; Back to home
            </button>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">VibeLearn</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin ? "Welcome back to your study workspace." : "Create an account to start active learning."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Abhijay"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 focus-visible:ring-primary"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                required
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary"
              />
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md font-medium border border-destructive/20">{error}</p>}

            <Button type="submit" size="lg" className="w-full text-md font-semibold transition-transform active:scale-[0.98]" disabled={isSubmitting}>
              {isSubmitting ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm pt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: Premium SaaS Landing Page
  // ==========================================
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-ai/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-xl tracking-tight">VibeLearn</span>
          </div>
          <Button variant="ghost" onClick={() => { setIsLogin(true); setShowAuth(true); }} className="font-medium">
            Sign In
          </Button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-20 md:pt-36 md:pb-32 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai/10 border border-ai/20 text-ai text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Powered by Llama 3.3
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Turn YouTube videos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">active learning.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop watching passively. VibeLearn uses AI to convert any educational video into structured notes, adaptive quizzes, and a personalized revision loop.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95" onClick={() => { setIsLogin(false); setShowAuth(true); }}>
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-border hover:bg-secondary transition-colors" onClick={() => { setIsLogin(true); setShowAuth(true); }}>
              Login to Workspace
            </Button>
          </div>
        </section>

        {/* Features / How it Works Section */}
        <section className="py-24 bg-card/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How VibeLearn Works</h2>
              <p className="text-muted-foreground">Three steps to mastering any complex topic.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PlayCircle className="w-24 h-24 text-primary" />
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20">
                  <PlayCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">1. Ingest</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Paste any educational YouTube URL. We instantly extract the transcript and process the core concepts.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="w-24 h-24 text-ai" />
                </div>
                <div className="w-12 h-12 bg-ai/10 rounded-xl flex items-center justify-center mb-6 border border-ai/20">
                  <BookOpen className="w-6 h-6 text-ai" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">2. Learn</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Study from beautifully formatted, AI-generated markdown notes within a distraction-free workspace.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-24 h-24 text-success" />
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6 border border-success/20">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">3. Master</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Take adaptive AI quizzes. We track your weak points and generate targeted master revisions to close knowledge gaps.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border py-8 text-center bg-background">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} VibeLearn. Built for students, by a student.
        </p>
      </footer>
    </div>
  );
}