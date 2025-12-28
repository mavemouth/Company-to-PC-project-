"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Info,
  LogOut,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useUser } from "../components/user-context";

// Define navigation items based on user role
const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Companies", href: "/admin/companies", icon: FileText },
];

const hodNavigation = [
  { name: "Dashboard", href: "/hod", icon: Home },
  { name: "Hiring Requests", href: "/hod/hiring-requests", icon: FileText },
];

const followUpTeamNavigation = [
  { name: "Dashboard", href: "/followup", icon: Home },
  {
    name: "Hiring Requests",
    href: "/followup/hiring-requests",
    icon: FileText,
  },
  { name: "Calendar", href: "/followup/calendar", icon: Calendar },
];

const hrNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Forms", href: "/dashboard/forms", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();

  // Get navigation items based on user role
  const getNavigation = () => {
    switch (user?.role) {
      case "ADMIN":
        return adminNavigation;
      case "HOD":
        return hodNavigation;
      case "FOLLOW_UP_TEAM":
        return followUpTeamNavigation;
      case "HR":
        return hrNavigation;
      default:
        return [];
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out user:", user?.email);
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 flex-col bg-white border-r border-gray-200 flex">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">CTPC</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.initials ||
                user?.name?.charAt(0) ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </span>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-gray-900">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {user?.role || "Guest"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {getNavigation().map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t pt-4 pb-4 px-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
