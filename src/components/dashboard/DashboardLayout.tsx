"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useIsMobile } from "@/hooks/useIsMobile";

import { MobileTopBar } from "./MobileTopBar";
import { MobileSidebar } from "./MobileSidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DashboardContent } from "./DashboardContent";

export function DashboardLayout() {
  const router = useRouter();
  const supabase = createClient();
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);

  // Layout States
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Centralized Auth Actions
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

  if (!mounted) return null;

  // ---------------------------------------------------------
  // MOBILE ARCHITECTURE
  // ---------------------------------------------------------
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileTopBar onOpenSidebar={() => setMobileSidebarOpen(true)} />
        
        <MobileSidebar
          isOpen={mobileSidebarOpen}
          setIsOpen={setMobileSidebarOpen}
          handleLogout={handleLogout}
          handleDeleteAccount={handleDeleteAccount}
        />
        
        {/* Dashboard naturally flows below the TopBar and takes full width */}
        <main className="flex-1 w-full p-4 pb-8 overflow-x-hidden">
          <DashboardContent />
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // DESKTOP ARCHITECTURE
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar
        collapsed={desktopCollapsed}
        setCollapsed={setDesktopCollapsed}
        handleLogout={handleLogout}
        handleDeleteAccount={handleDeleteAccount}
      />
      
      {/* Dashboard shifts dynamically based on sidebar width */}
      <main
        className={`flex-1 transition-[margin] duration-300 ease-in-out p-8 overflow-x-hidden ${
          desktopCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <DashboardContent />
      </main>
    </div>
  );
}