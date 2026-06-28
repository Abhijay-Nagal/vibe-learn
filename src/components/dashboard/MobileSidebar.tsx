"use client";

import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUser } from "@/context/UserContext";
import { Brain, LayoutDashboard, LogOut, Trash2 } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
}

export function MobileSidebar({
  isOpen,
  setIsOpen,
  handleLogout,
  handleDeleteAccount,
}: MobileSidebarProps) {
  const router = useRouter();
  const { user } = useUser();

  if (!user) return null;

  const onNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-card border-r-border">
        <SheetHeader className="p-6 text-left border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
              VibeLearn
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-center rounded-lg bg-muted py-2.5 border border-border mb-6">
            <span className="text-sm font-medium text-foreground">
              Hi, {user.username}
            </span>
          </div>

          <nav className="space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-start text-foreground bg-secondary/50 hover:bg-secondary"
              onClick={() => onNavigate("/dashboard")}
            >
              <LayoutDashboard className="mr-3 h-5 w-5 shrink-0 text-primary" />
              Dashboard
            </Button>
          </nav>
        </div>

        <div className="mt-auto border-t border-border p-4 space-y-2 pb-8">
          <div className="flex items-center justify-between px-4 py-2 mb-4">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4 shrink-0" />
            Sign Out
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="mr-3 h-4 w-4 shrink-0" />
            Delete Account
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}