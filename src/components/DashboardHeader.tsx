"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    // High-friction confirmation for destructive actions
    const confirmDelete = window.confirm(
      "Are you absolutely sure? This will permanently delete your account, all study sessions, videos, notes, and quizzes. This cannot be undone."
    );

    if (confirmDelete) {
      try {
        // Call the secure PostgreSQL function we just created
        const { error } = await supabase.rpc("delete_user");
        if (error) throw error;

        // Clear the local session and redirect
        await supabase.auth.signOut();
        router.push("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!user) return null;

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">VibeLearn</h1>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Hi, {user.username}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
        <Button variant="destructive" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </header>
  );
}