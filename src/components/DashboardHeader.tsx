"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Brain,
  LogOut,
  Trash2,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import React from "react";

interface DashboardHeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardHeader({
  collapsed,
  setCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileSidebarOpen(false);
    router.push("/#login");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure? This will permanently delete your account, all study sessions, videos, notes, and quizzes. This cannot be undone."
    );

    if (confirmDelete) {
      try {
        const { error } = await supabase.rpc("delete_user");
        if (error) throw error;

        await supabase.auth.signOut();
        setMobileSidebarOpen(false);
        router.push("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (window.matchMedia("(min-width: 768px)").matches) {
            setCollapsed(!collapsed);
          } else {
            setMobileSidebarOpen((prev) => !prev);
          }
        }}
        className="fixed top-3 left-4 z-[60]"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden
          border-r border-border bg-card shadow-sm
          transition-[width] duration-300

          w-20
          md:${collapsed ? "w-20" : "w-64"}

          ${mobileSidebarOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Top Section: Branding & User */}
        <div className="flex flex-col gap-6 p-6 pt-16">
          <div className="flex items-center justify-between">
            <div className="ml-[-5px] flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  collapsed ? "w-0 opacity-0" : "w-40 opacity-100"
                }`}
              >
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                  VibeLearn
                </h1>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-center rounded-lg bg-muted py-2.5 border border-border ${
              collapsed ? "px-2" : "px-4"
            }`}
          >
            {collapsed ? (
              <span className="text-sm font-medium text-foreground">
                {user.username.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span
                className={`text-sm font-medium text-foreground whitespace-nowrap transition-opacity duration-300 ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                Hi, {user.username}
              </span>
            )}
          </div>
        </div>

        {/* Middle Section: Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <Button 
            variant="secondary" 
            className={`w-full ${
              collapsed ? "justify-center px-0" : "justify-start"
            } text-foreground bg-secondary/50 hover:bg-secondary`} 
            onClick={() => {
              router.push("/dashboard");

              if (!window.matchMedia("(min-width:768px)").matches) {
                setMobileSidebarOpen(false);
              }
            }}
          >
            <LayoutDashboard className={`${collapsed ? "" : "mr-3"} h-5 w-5 shrink-0 text-primary`} />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-28 opacity-100"
              }`}
            >
              Dashboard
            </span>
          </Button>
        </nav>

        {/* Bottom Section: Utilities & Destructive Actions */}
        {/* Added pb-24 to keep controls well above any floating system logos */}
        <div className="border-t border-border p-4 space-y-2 pb-24">
          {collapsed ? (
            <div className="flex justify-center mb-4">
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-2 mb-4">
              <span
                className={`transition-opacity duration-300 ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                Theme
              </span>
              <ThemeToggle />
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className={`w-full ${
              collapsed ? "justify-center px-0" : "justify-start"
            } text-muted-foreground hover:text-foreground hover:bg-muted`} 
            onClick={handleLogout}
          >
            <LogOut className={`${collapsed ? "" : "mr-3"} h-4 w-4 shrink-0`} />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-20 opacity-100"
              }`}
            >
              Sign Out
            </span>
          </Button>
          
          <Button 
            variant="ghost" 
            className={`w-full ${
              collapsed ? "justify-center px-0" : "justify-start"
            } text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`} 
            onClick={handleDeleteAccount}
          >
            <Trash2 className={`${collapsed ? "" : "mr-3"} h-4 w-4 shrink-0`} />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-16 opacity-100"
              }`}
            >
              Delete
            </span>
          </Button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}