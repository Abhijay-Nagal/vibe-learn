"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/client"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  PlayCircle,
  FileText,
  CheckCircle,
  Sparkles,
  BookOpen,
  Video,
  ArrowLeft,
  X,
  FolderOpen
} from "lucide-react";

type VideoState = {
  id: string;
  yt_video_id: string;
  notes: string;
} | null;

type Folder = {
  id: string;
  yt_video_id: string;
  yt_url: string;
  notes: string;
  created_at: string;
};

export default function SessionDashboard() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const sessionId = params.id as string;

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoState>(null);
  
  // Phase 2.3: Mutually Exclusive Viewing Modes
  const [videoOnlyMode, setVideoOnlyMode] = useState(false);
  const [notesOnlyMode, setNotesOnlyMode] = useState(false);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, [sessionId]);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching folders:", error);
    } else {
      setFolders(data || []);
    }
    setIsLoadingFolders(false);
  };

  const handleIngestVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl, sessionId }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setActiveVideo(data.video);
      setYoutubeUrl("");
      fetchFolders(); 
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndAndQuiz = async () => {
    if (!activeVideo) return;
    
    if (window.confirm("Are you sure you want to end this video and generate an AI quiz?")) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            videoId: activeVideo.id,
            sessionId: sessionId,
            notes: activeVideo.notes
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        router.push(`/session/${sessionId}/quiz/${data.quizId}`);
      } catch (error: any) {
        alert(error.message || "Failed to generate quiz.");
        setIsLoading(false);
      }
    }
  };

  const handleEndSession = async () => {
    if (window.confirm("Are you ready to end this entire session? You will move to the Master Revision phase.")) {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);

      if (error) {
        alert("Failed to end session.");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setVideoOnlyMode(false);
    setNotesOnlyMode(false);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar Navigation */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          
          {!activeVideo ? (
            <Button variant="destructive" onClick={handleEndSession} className="shadow-sm">
              End Session
            </Button>
          ) : (
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              <Button 
                variant={videoOnlyMode ? "secondary" : "ghost"} 
                size="sm"
                className={`text-sm ${videoOnlyMode ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                onClick={() => {
                  setVideoOnlyMode(!videoOnlyMode);
                  setNotesOnlyMode(false);
                }}
              >
                <Video className="w-4 h-4 mr-2" /> Video View
              </Button>
              <Button 
                variant={notesOnlyMode ? "secondary" : "ghost"} 
                size="sm"
                className={`text-sm ${notesOnlyMode ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                onClick={() => {
                  setNotesOnlyMode(!notesOnlyMode);
                  setVideoOnlyMode(false);
                }}
              >
                <FileText className="w-4 h-4 mr-2" /> Focus Notes
              </Button>
            </div>
          )}
        </header>

        {/* Dynamic Workspace State */}
        {isLoading ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <LoadingScreen
              message={
                activeVideo
                  ? "Crafting your custom AI quiz..."
                  : "Fetching Transcript & Analyzing..."
              }
            />
          </div>
        ) : !activeVideo ? (
          <div className="space-y-12">
            {/* The Premium Ingestion Form */}
            <div className="bg-card p-8 md:p-12 rounded-2xl shadow-sm text-center max-w-2xl mx-auto mt-8 border border-border transition-all duration-200 hover:shadow-md">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Video size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Add a Video to your Workspace</h2>
              <p className="text-muted-foreground mb-8 text-sm md:text-base">Paste a YouTube educational link below. Our AI will instantly convert it into structured markdown notes and adaptive quizzes.</p>
              <form onSubmit={handleIngestVideo} className="space-y-4">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 text-base focus-visible:ring-primary shadow-sm"
                />
                <Button type="submit" size="lg" className="w-full bg-ai hover:bg-ai/90 text-ai-foreground font-semibold shadow-sm transition-transform active:scale-[0.98]" disabled={isLoading}>
                  <Sparkles className="mr-2 h-5 w-5" /> Generate Notes & Workspace
                </Button>
              </form>
            </div>

            {/* The Folders Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <CheckCircle className="text-success w-5 h-5" /> 
                <h3 className="text-lg font-semibold text-foreground">Processed Modules</h3>
              </div>
              
              {isLoadingFolders ? (
                <div className="animate-pulse flex gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-48 w-full bg-muted rounded-xl"></div>)}
                </div>
              ) : folders.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-foreground font-medium text-lg">Your workspace is empty</p>
                  <p className="text-muted-foreground text-sm mt-1">Add your first YouTube link above to begin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <Card key={folder.id} className="overflow-hidden flex flex-col border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="w-full h-40 bg-muted relative border-b border-border">
                        <img 
                          src={`https://img.youtube.com/vi/${folder.yt_video_id}/hqdefault.jpg`} 
                          alt="Video Thumbnail" 
                          className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardContent className="p-5 flex-grow">
                        <p className="text-xs text-muted-foreground mb-3 truncate font-medium">{folder.yt_url}</p>
                        <div className="flex items-center text-sm text-primary font-medium bg-primary/10 w-fit px-2.5 py-1 rounded-md">
                          <FileText className="w-4 h-4 mr-1.5" /> Notes Generated
                        </div>
                      </CardContent>
                      <CardFooter className="p-5 pt-0">
                        <Button 
                          variant="outline" 
                          className="w-full border-border hover:bg-secondary hover:text-secondary-foreground"
                          onClick={() => setActiveVideo(folder)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" /> Open Workspace
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Premium Study Workspace: Split UI */
          <div className="flex flex-col lg:flex-row gap-6 h-[85vh] transition-all duration-300">
            
            {/* Conditional Video Area */}
            {!notesOnlyMode && (
              <div className={`flex-grow ${videoOnlyMode ? "w-full" : "lg:w-[60%]"} bg-black rounded-2xl overflow-hidden shadow-md border border-border transition-all duration-300 flex items-center justify-center`}>
                <iframe
                  className="w-full h-full min-h-[400px]"
                  src={`https://www.youtube.com/embed/${activeVideo.yt_video_id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {/* Conditional Premium Notes Area */}
            {!videoOnlyMode && (
              <div className={`${notesOnlyMode ? "w-full max-w-4xl mx-auto" : "lg:w-[40%]"} flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-md transition-all duration-300`}>
                <div className="p-4 border-b border-border bg-muted/30 font-semibold flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-ai" />
                    <span className="text-foreground">AI Study Notes</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={closeVideo}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Polished Markdown Typography */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar">
                  <article className="prose prose-base dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                    prose-h1:text-2xl prose-h1:mb-6
                    prose-h2:text-xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-8
                    prose-h3:text-lg prose-h3:text-foreground/90
                    prose-p:text-foreground/80 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-code:text-ai prose-code:bg-ai/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#1E293B] prose-pre:text-white prose-pre:border prose-pre:border-border prose-pre:shadow-sm
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-foreground/80 prose-ol:text-foreground/80
                    prose-li:marker:text-primary/60"
                  >
                    <ReactMarkdown>{activeVideo.notes}</ReactMarkdown>
                  </article>
                </div>

                <div className="p-4 md:p-6 border-t border-border bg-muted/30">
                  <Button onClick={handleEndAndQuiz} size="lg" className="w-full bg-ai hover:bg-ai/90 text-ai-foreground font-semibold shadow-sm transition-transform active:scale-[0.98]">
                    <Sparkles className="mr-2 h-5 w-5" /> Generate AI Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}