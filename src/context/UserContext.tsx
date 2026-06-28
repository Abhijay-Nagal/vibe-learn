"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// The shape of the User remains exactly the same so we don't break V1 UI components
type User = {
  id: string;
  username: string;
  created_at: string;
} | null;

type UserContextType = {
  user: User;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // 1. Helper function to extract the Google name or Email name safely
    const getDisplayName = (authUser: any) => {
      return (
        authUser.user_metadata?.username ||    // Email/Password Name
        authUser.user_metadata?.full_name ||   // Google Account Name
        authUser.user_metadata?.name ||        // Google Account Name fallback
        authUser.email?.split("@")[0] ||       // Fallback to email prefix
        "Student"
      );
    };

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const displayName = getDisplayName(session.user);

          // 2. We use UPDATE instead of UPSERT to avoid database crashes.
          // Your backend trigger creates the row, we just fill in the missing Google name.
          await supabase
            .from("profiles")
            .update({ username: displayName })
            .eq("id", session.user.id);

          // 3. Immediately set the user context so the UI says "Hi [Name]"
          if (mounted) {
            setUser({
              id: session.user.id,
              username: displayName,
              created_at: new Date().toISOString()
            });
          }
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchSession();

    // Real-time listener for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const displayName = getDisplayName(session.user);

        // Safe update to prevent crashes
        await supabase
          .from("profiles")
          .update({ username: displayName })
          .eq("id", session.user.id);

        if (mounted) {
          setUser({
            id: session.user.id,
            username: displayName,
            created_at: new Date().toISOString()
          });
        }
      } else {
        if (mounted) setUser(null);
      } 
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}