"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../components/user-context";
import { Sidebar } from "../components/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!mounted || isLoading) return;

    if (pathname === "/login") {
      // User is on login page - allow it
      return;
    }

    if (!isAuthenticated || !user) {
      // User is not authenticated - redirect to login
      console.log("🔒 Redirecting to login - no authentication found");
      router.replace("/login");
      return;
    }

    // Check if user is trying to access a dashboard that doesn't match their role
    const roleToDashboardMap: { [key: string]: string[] } = {
      ADMIN: ["/admin", "/dashboard", "/"],
      HOD: ["/hod", "/dashboard"],
      FOLLOW_UP_TEAM: ["/followup", "/dashboard"],
      HR: ["/dashboard", "/"],
    };

    const allowedDashboards = roleToDashboardMap[user.role] || ["/login"];

    // Check if current path is allowed for this role
    const isAllowedPath = allowedDashboards.some(
      (dashboard) =>
        pathname === dashboard || pathname.startsWith(dashboard + "/")
    );

    if (!isAllowedPath && pathname !== "/login") {
      console.log(`🚫 User role '${user.role}' cannot access '${pathname}'`);
      // Redirect to user's home dashboard
      const homeRoute = allowedDashboards[0];
      router.replace(homeRoute);
    }
  }, [mounted, isLoading, isAuthenticated, user, pathname, router]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (pathname === "/login") {
    // Don't show sidebar on login page
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    // This shouldn't happen due to the redirect above, but just in case
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show dashboard with sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
