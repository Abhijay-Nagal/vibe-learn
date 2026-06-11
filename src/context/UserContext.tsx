"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define the shape of our User state
type User = {
  id: string;
  username: string;
  created_at: string;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage only once when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("vibelearn_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Sync state changes back to localStorage automatically
  const handleSetUser = (newUser: User) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("vibelearn_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("vibelearn_user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the User Context easily
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}