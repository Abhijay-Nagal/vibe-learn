"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUser } from "@/context/UserContext";
import {
  Brain,
  LogOut,
  Trash2,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface DesktopSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
}

export function DesktopSidebar({
  collapsed,
  setCollapsed,
  handleLogout,
  handleDeleteAccount,
}: DesktopSidebarProps) {
  const router = useRouter();
  const { user } = useUser();

  if (!user) return null;

  return (
    <aside
      className={`
        hidden md:flex fixed inset-y-0 left-0 z-50 flex-col overflow-hidden
        border-r border-border bg-card shadow-sm
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Top Section: Branding & User */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>

            <div
              className={`transition-all duration-300 ${
                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
              }`}
            >
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                VibeLearn
              </h1>
            </div>
          </div>
          
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>

        <div
          className={`flex items-center justify-center rounded-lg bg-muted py-2.5 border border-border transition-all duration-300 ${
            collapsed ? "px-2" : "px-4"
          }`}
        >
          {collapsed ? (
            <span className="text-sm font-medium text-foreground uppercase">
              {user.username.charAt(0)}
            </span>
          ) : (
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
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
          } text-foreground bg-secondary/50 hover:bg-secondary transition-all`}
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard className={`${collapsed ? "" : "mr-3"} h-5 w-5 shrink-0 text-primary`} />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            }`}
          >
            Dashboard
          </span>
        </Button>
      </nav>

      {/* Bottom Section: Utilities & Actions */}
      <div className="border-t border-border p-4 space-y-2 pb-6">
        {collapsed ? (
          <div className="flex justify-center mb-4">
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-2 mb-4">
            <span className="text-sm font-medium text-foreground transition-opacity duration-300">
              Theme
            </span>
            <ThemeToggle />
          </div>
        )}

        <Button
          variant="ghost"
          className={`w-full ${
            collapsed ? "justify-center px-0" : "justify-start"
          } text-muted-foreground hover:text-foreground hover:bg-muted transition-all`}
          onClick={handleLogout}
        >
          <LogOut className={`${collapsed ? "" : "mr-3"} h-4 w-4 shrink-0`} />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
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
              collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            }`}
          >
            Delete Account
          </span>
        </Button>
      </div>
    </aside>
  );
}