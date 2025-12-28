//For local run use http://localhost:5000 on ${process.env.NEXT_PUBLIC_API_BASE_URL}.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../components/user-context";

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!isAuthenticated || !user) {
      // Not authenticated, go to login
      router.replace("/login");
      return;
    }

    // Route based on user role
    const roleRoutingMap: { [key: string]: string } = {
      ADMIN: "/admin",
      HOD: "/hod",
      HR: "/dashboard",
      FOLLOW_UP_TEAM: "/followup",
    };

    const redirectUrl = roleRoutingMap[user.role] || "/dashboard";
    console.log(
      `🎯 Redirecting from root to: ${redirectUrl} (role: ${user.role})`
    );
    router.replace(redirectUrl);
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
