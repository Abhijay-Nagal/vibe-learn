"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

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

  // Auth Form State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      
      // Clean up the URL hash so it looks clean in the browser
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(err);
      setIsGoogleLoading(false);
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
              Continue with Google to access your workspace.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-background hover:bg-muted"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Connecting to Google..."
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
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
            
          <Button
  size="lg"
  className="h-14 px-12 text-lg font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
  onClick={() => setShowAuth(true)}
>
  Login to Workspace
  <ArrowRight className="ml-3 h-5 w-5" />
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