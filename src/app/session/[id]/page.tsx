"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VideoState = {
  id: string;
  yt_video_id: string;
  notes: string;
} | null;

export default function SessionDashboard() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoState>(null);
  const [videoOnlyMode, setVideoOnlyMode] = useState(false);

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
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Inside src/app/session/[id]/page.tsx

  const handleEndAndQuiz = async () => {
    if (!activeVideo) return;
    
    if (window.confirm("Are you sure you want to end this video and start the quiz?")) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            videoId: activeVideo.id, // Assuming activeVideo has the Supabase UUID as 'id'
            sessionId: sessionId,
            notes: activeVideo.notes
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Route to the new quiz UI
        router.push(`/session/${sessionId}/quiz/${data.quizId}`);
      } catch (error: any) {
        alert(error.message || "Failed to generate quiz.");
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar Navigation */}
        <header className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            &larr; Back to Dashboard
          </Button>
          {activeVideo && (
            <Button variant="secondary" onClick={() => setVideoOnlyMode(!videoOnlyMode)}>
              {videoOnlyMode ? "Show Notes" : "Video Only Mode"}
            </Button>
          )}
        </header>

        {/* Input State (If no video is active) */}
        {!activeVideo ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm text-center max-w-xl mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">Add a Video to Study</h2>
            <form onSubmit={handleIngestVideo} className="space-y-4">
              <Input
                placeholder="Paste YouTube Link here..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Fetching Transcript & Generating Notes..." : "Let's Begin"}
              </Button>
            </form>
          </div>
        ) : (
          /* Study Mode: Split UI */
          <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">
            {/* Left Side: Video (Expands if Video Only mode is true) */}
            <div className={`flex-grow ${videoOnlyMode ? "w-full" : "lg:w-2/3"} bg-black rounded-xl overflow-hidden shadow-lg`}>
              <iframe
                className="w-full h-full min-h-[400px]"
                src={`https://www.youtube.com/embed/${activeVideo.yt_video_id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Right Side: Markdown Notes */}
            {!videoOnlyMode && (
              <div className="lg:w-1/3 flex flex-col bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-zinc-100 dark:bg-zinc-800 font-semibold">
                  AI Generated Notes
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