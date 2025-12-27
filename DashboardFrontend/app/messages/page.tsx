"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useUser } from "../../components/user-context";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Users,
  Bell,
} from "lucide-react";

export default function MessagesPage() {
  const { user } = useUser();
  const [selectedConversation, setSelectedConversation] =
    useState("ctpc-admin");
  const [messageText, setMessageText] = useState("");

  // Get assigned team member for HR or show all conversations for team members/admin
  const conversations =
    user?.role === "HR"
      ? [
          {
            id: "assigned-member",
            name: "Team Member", // This will be replaced with actual assigned team member
            lastMessage: "Last message from conversation...",
            time: "02:30 PM",
            unread: 0,
            type: "direct",
          },
        ]
      : user?.role === "FOLLOW_UP_TEAM"
      ? [
          {
            id: "assigned-companies",
            name: "My Assigned Companies",
            lastMessage: "Messages from assigned companies...",
            time: "02:30 PM",
            unread: 0,
            type: "direct",
          },
        ]
      : [
          {
            id: "all-communications",
            name: "All Communications",
            lastMessage: "Overview of all conversations...",
            time: "02:30 PM",
            unread: 0,
            type: "direct",
          },
        ];

  const messages = [
    {
      id: 1,
      from: "CTPC Admin",
      content:
        "Hi! Could you please submit the placement reports by Friday? We need them for the monthly review.",
      time: "02:30 PM",
      sent: false,
    },
    {
      id: 2,
      from: "You",
      content:
        "Sure, I'll have them ready by Thursday evening. Should I include the department-wise breakdown?",
      time: "02:45 PM",
      sent: true,
    },
    {
      id: 3,
      from: "CTPC Admin",
      content:
        "Yes, please include the department-wise breakdown. That would be very helpful. Thanks!",
      time: "03:00 PM",
      sent: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Chat with team directly</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Messages</CardTitle>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 cursor-pointer border-l-4 transition-colors ${
                      selectedConversation === conv.id
                        ? "bg-blue-50 border-l-blue-600"
                        : "border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        {conv.type === "group" ? (
                          <Users className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.name}
                          </p>
                          {conv.unread > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {conv.time}
                        </p>
                        {conv.type === "group" && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Group
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">CTPC Admin</CardTitle>
                    <p className="text-sm text-gray-500">Direct Message</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sent
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sent ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
