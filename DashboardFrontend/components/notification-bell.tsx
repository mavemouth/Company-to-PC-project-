"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New request",
      message: "Apple Inc. created TU-2025-0001",
      time: "2m ago",
      read: false,
    },
    {
      id: 2,
      title: "Reminder",
      message: "Interview at 3:00 PM today",
      time: "30m ago",
      read: false,
    },
    {
      id: 3,
      title: "Update",
      message: "Microsoft responded to your message",
      time: "1h ago",
      read: true,
    },
  ]);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                !n.read ? "bg-blue-50" : ""
              }`}
              onClick={() => markRead(n.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-3 text-center text-xs text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
