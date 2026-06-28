"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, FolderOpen, PlayCircle, Plus, RotateCcw, Trash2, Video, BrainCircuit } from "lucide-react";

type Session = {
  id: string;
  title: string;
  status: "active" | "completed";
};

type DashboardStats = {
  totalSessions: number;
  completedSessions: number;
  totalVideos: number;
  totalQuizzes: number;
};

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalSessions: 0, completedSessions: 0, totalVideos: 0, totalQuizzes: 0 });
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // New states for Sidebar Navigation
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Protect the route and fetch data
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoadingData(true);

    // 1. Fetch Sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (sessionError) console.error("Error fetching sessions:", sessionError);
    else setSessions(sessionData || []);

    // 2. Fetch Analytics via RPC (Zero Vercel Timeout Risk)
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_dashboard_stats', { p_profile_id: user.id });

    if (statsError) console.error("Error fetching stats:", statsError);
    else if (statsData) setStats(statsData as DashboardStats);

    setIsLoadingData(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim() || !user) return;

    setIsCreating(true);

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ profile_id: user.id, title: newSessionTitle.trim() }])
      .select()
      .single();

    setIsCreating(false);

    if (error) {
      console.error("FULL SESSION ERROR:", error);
      alert(JSON.stringify(error));
    } else if (data) {
      router.push(`/session/${data.id}`);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const confirmEnd = window.confirm("Are you sure you want to end this session? You will move to the revision phase.");
    if (!confirmEnd) return;

    const { error } = await supabase
      .from("sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    if (error) console.error("Error ending session:", error);
    else fetchDashboardData();
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this session? This will permanently erase all associated videos, notes, quizzes, and progress data.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
      if (error) throw error;
      
      // Re-fetch data to update both the grid AND the stats counters
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session.");
    }
  };

  // The Premium Skeleton Loader
  if (isUserLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 animate-pulse text-primary" />
          <span className="text-lg font-medium text-muted-foreground">
            Loading your workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen bg-background
        ${mounted ? "transition-all duration-300" : ""}
        px-4 pb-8 pt-20
        ml-20
        md:pb-12 md:pt-12 md:pr-12
        ${collapsed ? "md:ml-20" : "md:ml-64"}
      `}
    >
      <DashboardHeader 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      
      <div className="w-full max-w-5xl mx-auto space-y-8 pt-2 md:pt-8">
        
        {/* Header & Command Center Analytics */}
        <div className="space-y-6">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                Welcome back, {user?.username}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Your Learning Command Center.
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto h-12 md:h-11 shadow-sm transition-transform active:scale-95">
                  <Plus className="mr-2 h-5 w-5" /> New Session
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
                <DialogHeader>
                  <DialogTitle>Create a New Study Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSession} className="space-y-4 pt-4">
                  <Input
                    placeholder="e.g., Data Structures & Algorithms"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    required
                    className="focus-visible:ring-primary"
                  />
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Initializing Workspace..." : "Create & Enter Workspace"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          {/* Analytics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2 opacity-80" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalSessions}</p>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Total Sessions</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center">
                <RotateCcw className="h-5 w-5 md:h-6 md:w-6 text-success mb-2 opacity-80" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.completedSessions}</p>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Mastered</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center">
                <Video className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2 opacity-80" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalVideos}</p>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Videos Processed</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center">
                <BrainCircuit className="h-5 w-5 md:h-6 md:w-6 text-ai mb-2 opacity-80" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalQuizzes}</p>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Quizzes Taken</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <hr className="border-border" />

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-24 px-4 text-center border-2 border-dashed border-border rounded-2xl bg-card">
            <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Study Sessions Yet</h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-sm mb-6">Your workspace is empty. Create your first session to start converting YouTube videos into active knowledge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="truncate flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </CardTitle>
                </CardHeader>

                <CardFooter className="flex flex-col gap-3">
                  {session.status === "active" ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        variant="default"
                        className="w-full sm:flex-1 shadow-sm"
                        onClick={() => router.push(`/session/${session.id}`)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" /> Continue
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 border-destructive text-destructive hover:bg-destructive/10 shadow-sm"
                        onClick={() => handleEndSession(session.id)}
                      >
                        End
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        className="w-full sm:flex-1 bg-success hover:bg-success/90 text-success-foreground shadow-sm"
                        onClick={() => router.push(`/session/${session.id}/revision`)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Revise
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 bg-secondary/50 hover:bg-secondary text-foreground shadow-sm"
                        onClick={() => router.push(`/session/${session.id}`)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" /> Archive
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Session
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}