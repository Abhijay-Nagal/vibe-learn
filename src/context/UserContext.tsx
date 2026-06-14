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

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch the public profile to get the username
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, created_at')
            .eq('id', session.user.id)
            .single();

          if (mounted && profile) {
            setUser(profile as User);
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, created_at')
          .eq('id', session.user.id)
          .single();
        setUser(profile as User);
      } else {
        setUser(null);
      }
      setIsLoading(false);
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