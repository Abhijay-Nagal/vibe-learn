"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Brain, Menu } from "lucide-react";

interface MobileTopBarProps {
  onOpenSidebar: () => void;
}

export function MobileTopBar({ onOpenSidebar }: MobileTopBarProps) {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="mr-1 shrink-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
            VibeLearn
          </span>
        </div>
      </div>

      {user && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
          <span className="text-sm font-medium text-foreground uppercase">
            {user.username ? user.username.charAt(0) : "U"}
          </span>
        </div>
      )}
    </header>
  );
}