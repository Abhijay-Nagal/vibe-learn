"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Session = {
  id: string;
  title: string;
  status: "active" | "completed";
};

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Protect the route and fetch sessions
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/");
      return;
    }

    if (user) {
      fetchSessions();
    }
  }, [user, isUserLoading, router]);

  const fetchSessions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions(data || []);
    }

    setIsLoadingSessions(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim() || !user) return;

    setIsCreating(true);

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ user_id: user.id, title: newSessionTitle.trim() }])
      .select()
      .single();

    setIsCreating(false);

    if (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session.");
    } else if (data) {
      router.push(`/session/${data.id}`);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end this session? You will move to the revision phase."
    );

    if (!confirmEnd) return;

    const { error } = await supabase
      .from("sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    if (error) {
      console.error("Error ending session:", error);
    } else {
      fetchSessions();
    }
  };

  if (isUserLoading || isLoadingSessions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Hi {user?.username}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Welcome back to your Smart Learning Platform.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg">+ New Session</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Study Session</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateSession} className="space-y-4 pt-4">
                <Input
                  placeholder="e.g., Graphs-Striver"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create & Enter"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {sessions.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed">
            No sessions yet. Create one to start learning!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="truncate">
                    {session.title}
                  </CardTitle>
                </CardHeader>

                <CardFooter>
                  {session.status === "active" ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() =>
                          router.push(`/session/${session.id}`)
                        }
                      >
                        Continue
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleEndSession(session.id)}
                      >
                        End Session
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() =>
                        router.push(`/session/${session.id}/revision`)
                      }
                    >
                      Do Revision
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}