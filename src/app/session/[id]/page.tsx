"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PlayCircle, FileText, CheckCircle } from "lucide-react"; // Icons for our folders

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
  const sessionId = params.id as string;

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoState>(null);
  const [videoOnlyMode, setVideoOnlyMode] = useState(false);
  
  // New state for the Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  // Fetch existing videos (folders) on mount
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
      fetchFolders(); // Refresh folders in the background
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndAndQuiz = async () => {
    if (!activeVideo) return;
    
    if (window.confirm("Are you sure you want to end this video and start the quiz?")) {
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

  return (
    <main className="min-h-screen p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Bar Navigation */}
        <header className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            &larr; Back to Dashboard
          </Button>
          {!activeVideo && (
            <Button variant="destructive" onClick={handleEndSession}>
              End Session
            </Button>
          )}
          {activeVideo && (
            <Button variant="secondary" onClick={() => setVideoOnlyMode(!videoOnlyMode)}>
              {videoOnlyMode ? "Show Notes" : "Video Only Mode"}
            </Button>
          )}
        </header>

        {/* Input State & Folders (If no video is currently active) */}
        {!activeVideo ? (
          <div className="space-y-12">
            {/* The Ingestion Form */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm text-center max-w-2xl mx-auto mt-8 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold mb-2">Add a Video to Study</h2>
              <p className="text-zinc-500 mb-6 text-sm">Paste a YouTube link below to generate AI notes and a custom quiz.</p>
              <form onSubmit={handleIngestVideo} className="space-y-4">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Fetching Transcript & Analyzing..." : "Let's Begin"}
                </Button>
              </form>
            </div>

            {/* The Folders Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-green-600 w-6 h-6" /> Completed Video Folders
              </h3>
              {isLoadingFolders ? (
                <p className="text-zinc-500">Loading folders...</p>
              ) : folders.length === 0 ? (
                <p className="text-zinc-500 italic">No videos studied in this session yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <Card key={folder.id} className="overflow-hidden flex flex-col">
                      {/* Dynamic YT Thumbnail */}
                      <div className="w-full h-40 bg-zinc-200 relative">
                        <img 
                          src={`https://img.youtube.com/vi/${folder.yt_video_id}/hqdefault.jpg`} 
                          alt="Video Thumbnail" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <p className="text-xs text-zinc-500 mb-2 truncate">{folder.yt_url}</p>
                        <div className="flex gap-4 mt-4">
                          <span className="flex items-center text-sm text-indigo-600 font-medium">
                            <FileText className="w-4 h-4 mr-1" /> Notes Saved
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {/* If they want to review notes, we load it back into the active state */}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveVideo(folder)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" /> Review Notes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Study Mode: Split UI (Unchanged from Milestone 4) */
          <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">
            <div className={`flex-grow ${videoOnlyMode ? "w-full" : "lg:w-2/3"} bg-black rounded-xl overflow-hidden shadow-lg`}>
              <iframe
                className="w-full h-full min-h-[400px]"
                src={`https://www.youtube.com/embed/${activeVideo.yt_video_id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {!videoOnlyMode && (
              <div className="lg:w-1/3 flex flex-col bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-zinc-100 dark:bg-zinc-800 font-semibold flex justify-between items-center">
                  <span>AI Generated Notes</span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveVideo(null)}>Close</Button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow prose dark:prose-invert prose-sm">
                  <ReactMarkdown>{activeVideo.notes}</ReactMarkdown>
                </div>
                <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900">
                  <Button onClick={handleEndAndQuiz} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    End and Start Quiz
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