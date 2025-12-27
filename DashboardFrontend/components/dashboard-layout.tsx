"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../components/user-context";
import { Sidebar } from "../components/sidebar";
import { Bell } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname === "/login") {
      // Allow login page
      return;
    }
    // For all other pages, show the dashboard without authentication check
  }, [mounted, pathname]);

  if (!mounted) {
    return null;
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Always show dashboard content without authentication check
  return <>{children}</>;
}
