"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Calendar, MessageSquare, Info } from "lucide-react";
import { Badge } from "components/ui/badge";
import { useUser } from "components/user-context";

// Define navigation items based on user role
const adminNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Companies", href: "/companies", icon: FileText },
  { name: "Settings", href: "/settings", icon: Info },
];

const hodNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Hiring Requests", href: "/hiring-requests", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Info },
];

const followUpTeamNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Hiring Requests", href: "/hiring-requests", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: Info },
];

const hrNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

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
          <div className="flex flex-col">
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
                {item.name === "Hiring Requests" && (
                  <Badge className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5">
                    23
                  </Badge>
                )}
                {item.name === "Messages" && (
                  <Badge className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5">
                    5
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t pt-4 pb-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="text-sm text-gray-500">3 Issues</span>
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
      </div>
    </aside>
  );
}
