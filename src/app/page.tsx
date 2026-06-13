"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const {
  user,
  setUser,
  isLoading: isUserLoading,
} = useUser();

  // Redirect logged-in users only after UserContext finishes loading
  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);

    try {
      // 1. Check if user exists in Supabase
      let { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .single();

      // 2. If user doesn't exist, create them
      if (fetchError && fetchError.code === "PGRST116") {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([{ username: username.trim() }])
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
      } else if (fetchError) {
        throw fetchError;
      }

      // 3. Save to localStorage and redirect
      setUser(user);
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Smart Learning Platform
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your username to pick up where you left off.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="text"
            placeholder="e.g., Abhijay"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            className="w-full"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Let's Begin"}
          </Button>
        </form>
      </div>
    </main>
  );
}