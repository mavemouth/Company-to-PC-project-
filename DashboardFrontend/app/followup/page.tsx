"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  BarChart3,
  ListTodo,
  Building,
  Search,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Briefcase,
  Settings,
  Bell,
} from "lucide-react";

export default function FollowupTeamDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [assignedRequests, setAssignedRequests] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState<any>({});
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [teamProgress, setTeamProgress] = useState<any[]>([]);
  const [dashboardTime, setDashboardTime] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track dashboard time
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardTime((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Poll for new messages every 5 seconds when a contact is selected
  useEffect(() => {
    if (selectedContact && user) {
      const interval = setInterval(() => {
        fetchConversation(selectedContact.email);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedContact, user]);

  // Refresh data every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchAllData(user.email);
        fetchUnreadCount();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/messages/unread-count?email=${encodeURIComponent(
          //http://localhost:5000
          user.email
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "FOLLOW_UP_TEAM") {
        router.push("/login");
      } else {
        setUser(userData);
        fetchAllData(userData.email);
        fetchUnreadCount();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchAllData = async (email: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch assigned requests
      const requestsRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/followup/assigned-requests?email=${encodeURIComponent(email)}`, //http://localhost:5000
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setAssignedRequests(data);
        console.log("✅ Fetched assigned requests:", data.length);
      } else {
        console.error(
          "Failed to fetch assigned requests:",
          await requestsRes.text()
        );
      }

      // Fetch today's tasks
      const tasksRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/followup/tasks/today?email=${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTodayTasks(data);
        console.log("✅ Fetched tasks:", data.length);
      } else {
        console.error("Failed to fetch tasks:", await tasksRes.text());
      }

      // Fetch analytics
      const analyticsRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/followup/analytics?email=${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
        console.log("✅ Fetched analytics:", data);
      } else {
        console.error("Failed to fetch analytics:", await analyticsRes.text());
      }

      // Fetch calendar events
      const calendarRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/followup/calendar?email=${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (calendarRes.ok) {
        const data = await calendarRes.json();
        setCalendarEvents(data);
        console.log("✅ Fetched calendar events:", data.length);
      } else {
        console.error("Failed to fetch calendar:", await calendarRes.text());
      }

      // Fetch team progress
      const teamRes = await fetch(
        "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team/team-progress", //http://localhost:5000
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeamProgress(data);
        console.log("✅ Fetched team progress:", data);
      } else {
        console.error("Failed to fetch team progress:", await teamRes.text());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedContact || !messageText.trim() || !user) return;

    try {
      // Send message to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/send`, //http://localhost:5000
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: user.email,
            senderName: user.name,
            senderRole: "FOLLOW_UP_TEAM",
            recipientEmail: selectedContact.email,
            recipientName: selectedContact.name,
            recipientRole: "HR",
            message: messageText,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Update local conversation
        const contactKey = selectedContact.email;
        const newMessage = {
          id: data.message._id,
          text: messageText,
          sender: "me",
          senderEmail: user.email,
          timestamp: new Date(data.message.createdAt).toLocaleTimeString(),
          date: new Date(data.message.createdAt).toLocaleDateString(),
        };

        setConversations((prev: any) => ({
          ...prev,
          [contactKey]: [...(prev[contactKey] || []), newMessage],
        }));

        setMessageText("");
        fetchUnreadCount(); // Refresh unread count
      } else {
        console.error("Failed to send message:", await response.text());
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Fetch messages for a conversation
  const fetchConversation = async (partnerEmail: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/messages/conversation?user1=${encodeURIComponent(
          user.email
        )}&user2=${encodeURIComponent(partnerEmail)}`
      );

      if (response.ok) {
        const messages = await response.json();

        // Format messages for display
        const formattedMessages = messages.map((msg: any) => ({
          id: msg._id,
          text: msg.message,
          sender: msg.senderEmail === user.email ? "me" : "them",
          senderEmail: msg.senderEmail,
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
          date: new Date(msg.createdAt).toLocaleDateString(),
        }));

        setConversations((prev: any) => ({
          ...prev,
          [partnerEmail]: formattedMessages,
        }));

        // Mark messages as read
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/mark-read`, //http://localhost:5000
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              senderEmail: partnerEmail,
              recipientEmail: user.email,
            }),
          }
        );
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const getUserDisplayName = () => {
    return (
      user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Team Member"
    );
  };

  const getUserInitials = () => {
    const name = user?.name || user?.email || "User";
    return name.charAt(0).toUpperCase();
  };

  // Generate notifications from tasks and messages
  useEffect(() => {
    if (user && assignedRequests.length > 0) {
      const newNotifications = [
        ...assignedRequests.slice(0, 3).map((req: any) => ({
          id: req._id,
          type: "assignment",
          title: `New Assignment: ${req.companyName}`,
          message: `Contact ${req.hrEmail} regarding hiring process`,
          time: new Date(req.assignedAt || req.createdAt).toLocaleString(),
          read: false,
        })),
      ];
      setNotifications(newNotifications);
    }
  }, [assignedRequests, user]);

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/followup/request/${taskId}/status?email=${encodeURIComponent(
          //http://localhost:5000
          user.email
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Status updated to ${newStatus}`,
          }),
        }
      );

      if (response.ok) {
        // Refresh data
        fetchAllData(user.email);
        setShowTaskModal(false);
        alert("Task status updated successfully!");
      } else {
        console.error("Failed to update status:", await response.text());
        alert("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const Sidebar = () => (
    <div className="fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CTPC</h1>
          <p className="text-sm text-gray-500">Follow-up Team</p>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{getUserInitials()}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "dashboard"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveSection("messages")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "messages"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          Messages
          {unreadCount > 0 && (
            <Badge className="ml-auto bg-red-100 text-red-700">
              {unreadCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveSection("tasks")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "tasks"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ListTodo className="h-5 w-5" />
          Tasks
          <Badge className="ml-auto bg-green-100 text-green-700">
            {todayTasks.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveSection("analytics")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "analytics"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Analytics
        </button>

        <button
          onClick={() => setActiveSection("calendar")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "calendar"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </button>

        <button
          onClick={() => setActiveSection("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "settings"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </nav>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {getUserDisplayName()}! Here's your overview.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Assigned Companies
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {assignedRequests.length}
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {todayTasks.length}
                      </p>
                    </div>
                    <ListTodo className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.completedTasks || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assigned Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedRequests
                      .slice(0, 5)
                      .map((request: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.companyName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {request.hrEmail}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                      ))}
                    {assignedRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No companies assigned yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayTasks.slice(0, 5).map((task: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {task.title || task.companyName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {task.description || "Follow up with HR"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {todayTasks.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No tasks for today
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "messages":
        // Get unique HRs from assigned requests
        const hrContacts = assignedRequests
          .map((request: any) => {
            // Extract HR info from the request
            const hrInfo = request.form?.hrContacts?.[0] || {};
            return {
              name:
                request.hrName ||
                hrInfo.name ||
                request.hrEmail?.split("@")[0] ||
                "HR",
              email: request.hrEmail || hrInfo.email,
              company: request.companyName,
              avatar:
                (request.hrName || request.hrEmail)?.charAt(0)?.toUpperCase() ||
                "H",
            };
          })
          .filter((contact) => contact.email); // Filter out any without email

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                Communicate with assigned HR contacts
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              <Card className="lg:col-span-1">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Assigned HRs ({hrContacts.length})
                    </h3>
                  </div>
                  <div className="max-h-[520px] overflow-y-auto">
                    {hrContacts.length > 0 ? (
                      hrContacts.map((contact: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedContact(contact);
                            fetchConversation(contact.email);
                          }}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedContact?.email === contact.email
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {contact.avatar}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {contact.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {contact.company}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No HR contacts assigned yet</p>
                        <p className="text-sm mt-2">
                          New assignments will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-0 h-full flex flex-col">
                  {selectedContact ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {selectedContact.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedContact.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedContact.company}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {(conversations[selectedContact.email] || []).length >
                        0 ? (
                          conversations[selectedContact.email].map(
                            (msg: any) => (
                              <div
                                key={msg.id}
                                className={`mb-3 flex ${
                                  msg.sender === "me"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-xs px-4 py-2 rounded-lg ${
                                    msg.sender === "me"
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-gray-900"
                                  }`}
                                >
                                  <p>{msg.text}</p>
                                  <p className="text-xs mt-1 opacity-75">
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && sendMessage()
                            }
                          />
                          <Button
                            onClick={sendMessage}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <MessageSquare className="h-12 w-12 mb-4" />
                      <p>Select a contact to start messaging</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600">
                Manage your follow-up tasks and company assignments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ListTodo className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayTasks.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analytics.completedTasks || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-bold text-gray-900">
                        {Math.max(
                          0,
                          assignedRequests.filter(
                            (req) => req.status === "pending"
                          ).length
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.length > 0 ? (
                    todayTasks.map((task: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {task.companyName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {task.description ||
                                `Follow up with ${task.hrName || task.hrEmail}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Assigned:{" "}
                              {new Date(task.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              task.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {task.status === "in_progress"
                              ? "In Progress"
                              : task.status === "completed"
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskModal(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks assigned yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        New company assignments will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">
                Track your performance and productivity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Assigned</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.totalAssigned || assignedRequests.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.completedTasks || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.inProgress || todayTasks.length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.successRate || 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedRequests
                      .slice(0, 5)
                      .map((request: any, index: number) => {
                        const assignedDate =
                          request.assignedAt || request.createdAt;
                        const dateStr = assignedDate
                          ? new Date(assignedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently";

                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {request.companyName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assigned on {dateStr}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">
                              {request.status === "completed"
                                ? "Completed"
                                : "Active"}
                            </Badge>
                          </div>
                        );
                      })}
                    {assignedRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No activity yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Task Completion
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {analytics.completionRate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${analytics.completionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Time on Dashboard
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.floor(dashboardTime / 60)}h {dashboardTime % 60}
                          m
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (dashboardTime / 480) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Target: 8 hours/day
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Progress Chart - Common for all members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamProgress.length > 0 ? (
                    teamProgress.map((member: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {member.completed}/{member.totalAssigned} (
                            {member.completionRate}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${member.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>✓ Completed: {member.completed}</span>
                          <span>⏳ In Progress: {member.inProgress}</span>
                          <span>⏸ Pending: {member.pending}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Loading team progress...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Individual Progress Chart - Specific to logged-in user */}
            <Card>
              <CardHeader>
                <CardTitle>My Individual Progress (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end justify-between h-24 gap-2">
                    {(() => {
                      const days = [];
                      const today = new Date();

                      // Generate last 7 days starting from Monday of current week
                      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                      const daysFromMonday =
                        currentDay === 0 ? 6 : currentDay - 1; // Days since last Monday

                      for (let i = 6; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(
                          today.getDate() - daysFromMonday - (6 - i)
                        );
                        const dayName = date.toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                        const dateStr = date.toDateString();

                        // Filter requests for this specific date
                        const requestsForDay = assignedRequests.filter(
                          (req) => {
                            const assignedDate = new Date(
                              req.assignedAt || req.createdAt
                            );
                            return assignedDate.toDateString() === dateStr;
                          }
                        );

                        const totalForDay = requestsForDay.length;
                        const completedForDay = requestsForDay.filter(
                          (req) => req.status === "completed"
                        ).length;
                        const inProgressForDay = requestsForDay.filter(
                          (req) => req.status === "in_progress"
                        ).length;
                        const pendingForDay = requestsForDay.filter(
                          (req) => req.status === "pending"
                        ).length;

                        days.push({
                          dayName,
                          date: date.getDate(),
                          totalForDay,
                          completedForDay,
                          inProgressForDay,
                          pendingForDay,
                        });
                      }

                      return days.map((dayData, index) => {
                        const maxHeight = 80;
                        const total = dayData.totalForDay || 1;
                        const completedHeight =
                          (dayData.completedForDay / total) * maxHeight;
                        const inProgressHeight =
                          (dayData.inProgressForDay / total) * maxHeight;
                        const pendingHeight =
                          (dayData.pendingForDay / total) * maxHeight;

                        return (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div
                              className="w-full flex flex-col-reverse items-center gap-0.5"
                              style={{ height: maxHeight }}
                            >
                              {dayData.completedForDay > 0 && (
                                <div
                                  className="w-full bg-green-500 rounded transition-all hover:bg-green-600"
                                  style={{ height: `${completedHeight}px` }}
                                  title={`Completed: ${dayData.completedForDay}`}
                                ></div>
                              )}
                              {dayData.inProgressForDay > 0 && (
                                <div
                                  className="w-full bg-blue-500 rounded transition-all hover:bg-blue-600"
                                  style={{ height: `${inProgressHeight}px` }}
                                  title={`In Progress: ${dayData.inProgressForDay}`}
                                ></div>
                              )}
                              {dayData.pendingForDay > 0 && (
                                <div
                                  className="w-full bg-orange-400 rounded transition-all hover:bg-orange-500"
                                  style={{ height: `${pendingHeight}px` }}
                                  title={`Pending: ${dayData.pendingForDay}`}
                                ></div>
                              )}
                            </div>
                            <span className="text-xs text-gray-600">
                              {dayData.dayName}
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {dayData.totalForDay}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-400 rounded"></div>
                      <span className="text-xs text-gray-600">Pending</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "calendar":
        // Generate calendar data from events
        const generateCalendar = () => {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const firstDay = new Date(currentYear, currentMonth, 1);
          const startDate = new Date(firstDay);
          startDate.setDate(startDate.getDate() - firstDay.getDay());

          const calendar = [];
          const visitMap = new Map();

          // Map events to dates
          calendarEvents.forEach((event: any) => {
            const eventDate = new Date(event.visitDate || event.startDate);
            const dateKey = eventDate.toDateString();
            if (!visitMap.has(dateKey)) {
              visitMap.set(dateKey, []);
            }
            visitMap.get(dateKey).push(event);
          });

          for (let week = 0; week < 6; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
              const currentDate = new Date(startDate);
              currentDate.setDate(startDate.getDate() + week * 7 + day);

              const isCurrentMonth = currentDate.getMonth() === currentMonth;
              const isToday = currentDate.toDateString() === now.toDateString();
              const visits = visitMap.get(currentDate.toDateString()) || [];
              const isBusy = visits.length > 0;

              weekDays.push({
                date: currentDate,
                isCurrentMonth,
                isToday,
                visits,
                isBusy,
              });
            }
            calendar.push(weekDays);
          }
          return calendar;
        };

        const calendar = generateCalendar();
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const now = new Date();

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">
                Company visits and important dates
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
                {calendarEvents.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No events scheduled
                      </h3>
                      <p className="text-gray-500">
                        Campus visits will appear here when scheduled.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  calendarEvents
                    .slice(0, 10)
                    .map((event: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CalendarIcon className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {event.stageName || "Campus Visit"}
                              </h4>
                              <p className="text-sm text-gray-600 mb-1">
                                {event.companyName}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  {new Date(
                                    event.visitDate || event.startDate
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  {new Date(
                                    event.visitDate || event.startDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                event.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : event.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {event.status === "in_progress"
                                ? "Active"
                                : event.status === "completed"
                                ? "Done"
                                : "Pending"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[now.getMonth()]} {now.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                      <span>Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                      <span>Scheduled</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="space-y-1">
                  {calendar.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((dayData, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`
                            p-2 h-12 text-sm border rounded cursor-pointer transition-colors
                            ${
                              dayData.isCurrentMonth
                                ? "text-gray-900"
                                : "text-gray-300"
                            }
                            ${
                              dayData.isToday
                                ? "bg-blue-100 border-blue-300 font-semibold"
                                : "border-gray-200"
                            }
                            ${
                              dayData.isBusy
                                ? "bg-orange-50 hover:bg-orange-100 border-orange-200"
                                : "bg-white hover:bg-gray-50"
                            }
                          `}
                          title={
                            dayData.visits.length > 0
                              ? dayData.visits
                                  .map((v: any) => v.companyName)
                                  .join(", ")
                              : "No events"
                          }
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span>{dayData.date.getDate()}</span>
                            {dayData.visits.length > 0 && (
                              <div className="flex gap-0.5 mt-1">
                                {dayData.visits
                                  .slice(0, 3)
                                  .map((_: any, i: number) => (
                                    <div
                                      key={i}
                                      className="w-1 h-1 bg-orange-600 rounded-full"
                                    ></div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage your account and preferences
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input value={user.name || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input value={user.email || ""} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Input value="Follow-up Team Member" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive email updates for new assignments
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Task Reminders</p>
                    <p className="text-sm text-gray-500">
                      Get reminded about pending tasks
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-72">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <Badge className="bg-red-100 text-red-700">
                        {notifications.filter((n) => !n.read).length}
                      </Badge>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Company Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Company Name:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTask.companyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">HR Contact:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTask.hrName || selectedTask.hrEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTask.hrEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge
                      className={
                        selectedTask.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : selectedTask.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {selectedTask.status === "in_progress"
                        ? "In Progress"
                        : selectedTask.status === "completed"
                        ? "Completed"
                        : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Form Details if available */}
              {selectedTask.form && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Job Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {selectedTask.form.jobDescriptions?.map(
                      (job: any, idx: number) => (
                        <div
                          key={idx}
                          className="border-b border-gray-200 pb-3 last:border-0"
                        >
                          <p className="font-medium text-gray-900">
                            {job.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Type: {job.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            Openings: {job.openings || "N/A"}
                          </p>
                          {job.skills && (
                            <p className="text-sm text-gray-600">
                              Skills: {job.skills}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Campus Visits */}
              {selectedTask.form?.campusVisits &&
                selectedTask.form.campusVisits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                      Campus Visits
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {selectedTask.form.campusVisits.map(
                        (visit: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-600">
                              {visit.stageName}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(visit.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Action Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Action Required
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    {selectedTask.description ||
                      `Please contact ${
                        selectedTask.hrName || selectedTask.hrEmail
                      } regarding the hiring process for ${
                        selectedTask.companyName
                      }.`}
                  </p>
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Update Status
                </h3>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      updateTaskStatus(selectedTask.id, "in_progress")
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={selectedTask.status === "in_progress"}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    onClick={() =>
                      updateTaskStatus(selectedTask.id, "completed")
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={selectedTask.status === "completed"}
                  >
                    Mark Completed
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                Close
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSelectedContact({
                    name: selectedTask.hrName || selectedTask.hrEmail,
                    email: selectedTask.hrEmail,
                    company: selectedTask.companyName,
                    avatar: (selectedTask.hrName || selectedTask.hrEmail)
                      ?.charAt(0)
                      ?.toUpperCase(),
                  });
                  fetchConversation(selectedTask.hrEmail);
                  setActiveSection("messages");
                  setShowTaskModal(false);
                }}
              >
                Message HR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
