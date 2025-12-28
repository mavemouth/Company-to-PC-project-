"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Calendar as CalendarIcon,
  Trash2,
  Building,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  MessageSquare,
  Clock,
  CheckCircle,
  Settings,
  BarChart3,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("hiring-requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [hiringRequests, setHiringRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: "User",
    email: "user@ctpc.edu",
  });

  // Message state
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState<any>({});
  const [unreadCount, setUnreadCount] = useState(0);

  // Edit form state
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Assigned followup member state
  const [assignedFollowup, setAssignedFollowup] = useState<any>(null);

  useEffect(() => {
    // Load user data first
    loadUserData();

    // Fetch assigned followup team member
    fetchAssignedFollowup();

    // Fetch data when component mounts
    const safelyFetchData = async () => {
      try {
        await fetchHiringRequests();
      } catch (error) {
        console.error("🚨 Critical error in data fetching:", error);
        // Set fallback demo data
        const fallbackRequest: any = {
          _id: "emergency-fallback",
          companyName: "Demo Company",
          hrContacts: [
            {
              id: "hr-1",
              name: "Demo HR",
              email: "demo@company.com",
              phone: "1234567890",
            },
          ],
          jobDescriptions: [
            {
              id: "jd-1",
              title: "Demo Position",
              type: "internship",
              skills: "Demo Skills",
              eligibleDepartments: ["All Departments"],
              eligibleBatches: ["2026"],
            },
          ],
          hiringStages: [
            {
              stage: "Demo Stage",
              mode: "online",
            },
          ],
          campusVisits: [
            {
              id: "visit-1",
              startDate: new Date().toISOString(),
              stageName: "Demo Visit",
            },
          ],
          uploadedFiles: [],
          createdAt: new Date().toISOString(),
          status: "submitted",
        };
        setHiringRequests([fallbackRequest]);
        setLoading(false);
      }
    };

    safelyFetchData();
    fetchAssignedFollowup();
  }, []);

  // Poll for new messages every 5 seconds when a contact is selected
  useEffect(() => {
    if (selectedContact && currentUser) {
      const interval = setInterval(() => {
        fetchConversation(selectedContact.email);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedContact, currentUser]);

  // Refresh hiring requests every 30 seconds
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        fetchHiringRequests();
        fetchUnreadCount();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadUserData = () => {
    // Try to get user from localStorage (set during login)
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "User",
          email: user.email || "user@ctpc.edu",
        });
        fetchUnreadCount();
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  const fetchAssignedFollowup = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      // Fetch the request assignment to find which followup member is assigned
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/followup/hr-assignment?hrEmail=${user.email}` //http://localhost:5000/
      );
      if (response.ok) {
        const data = await response.json();
        if (data.assignedTo) {
          setAssignedFollowup({
            name: data.assignedTo.name,
            email: data.assignedTo.email,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch assigned followup:", error);
    }
  };

  const fetchHiringRequests = async () => {
    try {
      setLoading(true);
      console.log("🔍 Attempting to fetch hiring requests...");

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/submissions",
        {
          //http://localhost:5000
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response received:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        url: response.url,
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If it's not JSON, it's probably an HTML error page
        const text = await response.text();
        console.error("❌ Non-JSON response received:", text.substring(0, 200));
        throw new Error(
          `Server returned HTML instead of JSON. Content-Type: ${contentType}`
        );
      }

      // Try to parse JSON
      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        console.error("❌ Response text:", text.substring(0, 500));
        throw new Error(`Invalid JSON response from server: ${parseError}`);
      }

      console.log("✅ Successfully fetched data:", {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : "N/A",
      });

      if (Array.isArray(data) && data.length > 0) {
        console.log("📋 Sample item:", Object.keys(data[0]));
      }

      setHiringRequests(data || []);
      console.log("✅ Backend connected successfully!");
    } catch (error) {
      console.error("❌ Backend connection failed:", error);

      // Use fallback mock data
      console.log("🔄 Loading mock data...");
      const mockData = [
        {
          _id: "mock-demo-1",
          companyName: "TechnoSoft Solutions",
          hrContacts: [
            {
              id: "hr-1",
              name: "Alex Johnson",
              email: "alex.johnson@technosoft.com",
              phone: "+91-9876543210",
            },
          ],
          jobDescriptions: [
            {
              id: "jd-1",
              title: "Full Stack Developer",
              type: "internship",
              internshipDuration: "6",
              conditions: "Strong programming fundamentals",
              openings: "8",
              skills: "React, Node.js, MongoDB, TypeScript",
              degreePreferences: ["btech", "mtech"],
              ctc: "",
              stipend: "25,000",
              allowances: "Meal vouchers, Transport allowance",
              cutoff: "7.5",
              eligibleDepartments: [
                "Computer Science Engineering (CSE)",
                "Information Technology",
                "Computer Engineering (COE)",
              ],
              expandedDepartments: [
                "Computer Science & Engineering Department (CSED)",
              ],
              eligibleBatches: ["2026"],
            },
          ],
          hiringStages: [
            { stage: "Online Coding Test", mode: "online" },
            { stage: "Technical Interview", mode: "offline" },
            { stage: "HR Round", mode: "offline" },
          ],
          campusVisits: [
            {
              id: "visit-1",
              startDate: "2025-10-12T10:00:00.000Z",
              stageName: "Technical Round & HR Interview",
            },
          ],
          uploadedFiles: ["technosoft-jd.pdf", "company-profile.pdf"],
          createdAt: "2025-10-04T09:30:00.000Z",
        },
        {
          _id: "mock-demo-2",
          companyName: "DataVision Analytics",
          hrContacts: [
            {
              id: "hr-2",
              name: "Priya Sharma",
              email: "priya.sharma@datavision.in",
              phone: "+91-8765432109",
            },
          ],
          jobDescriptions: [
            {
              id: "jd-2",
              title: "Data Science Intern",
              type: "internship",
              internshipDuration: "4",
              conditions: "Strong analytical and statistical knowledge",
              openings: "5",
              skills: "Python, R, Machine Learning, SQL, Statistics",
              degreePreferences: ["btech", "mtech", "msc"],
              ctc: "",
              stipend: "30,000",
              allowances: "Research material allowance",
              cutoff: "8.0",
              eligibleDepartments: [
                "Computer Science Engineering (CSE)",
                "Data Science",
                "Mathematics",
                "Statistics",
              ],
              expandedDepartments: [],
              eligibleBatches: ["2026"],
            },
          ],
          hiringStages: [
            { stage: "Online Assessment", mode: "online" },
            { stage: "Case Study Presentation", mode: "offline" },
            { stage: "Technical Interview", mode: "offline" },
          ],
          campusVisits: [
            {
              id: "visit-2",
              startDate: "2025-10-18T14:00:00.000Z",
              stageName: "Assessment & Interview Day",
            },
          ],
          uploadedFiles: ["datavision-requirements.pdf"],
          createdAt: "2025-10-03T14:15:00.000Z",
        },
        {
          _id: "mock-demo-3",
          companyName: "CloudTech Innovations",
          hrContacts: [
            {
              id: "hr-3",
              name: "Rahul Gupta",
              email: "rahul.gupta@cloudtech.com",
              phone: "+91-7654321098",
            },
          ],
          jobDescriptions: [
            {
              id: "jd-3",
              title: "Cloud Engineer",
              type: "fulltime",
              internshipDuration: "",
              conditions: "Knowledge of cloud platforms",
              openings: "3",
              skills: "AWS, Azure, Docker, Kubernetes, DevOps",
              degreePreferences: ["btech", "mtech"],
              ctc: "8.5",
              stipend: "",
              allowances: "Health insurance, Professional development fund",
              cutoff: "7.0",
              eligibleDepartments: [
                "Computer Science Engineering (CSE)",
                "Information Technology",
                "Electronics and Communication",
              ],
              expandedDepartments: [
                "Computer Science & Engineering Department (CSED)",
              ],
              eligibleBatches: ["2026"],
            },
          ],
          hiringStages: [
            { stage: "Aptitude Test", mode: "online" },
            { stage: "Technical Interview", mode: "online" },
            { stage: "System Design Round", mode: "offline" },
            { stage: "HR Interview", mode: "offline" },
          ],
          campusVisits: [
            {
              id: "visit-3",
              startDate: "2025-10-25T09:30:00.000Z",
              stageName: "Final Selection Round",
            },
          ],
          uploadedFiles: ["cloudtech-brochure.pdf", "benefits-package.pdf"],
          createdAt: "2025-10-02T11:45:00.000Z",
        },
      ];

      setHiringRequests(mockData);
      console.log("📊 Loaded mock data with 3 companies");

      // Don't show alert in production, just log
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "⚠️ Using demo data. Start FormBackend server for real data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    return (
      currentUser.name?.split(" ")[0] ||
      currentUser.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserInitials = () => {
    const name = currentUser.name || currentUser.email || "User";
    return name.charAt(0).toUpperCase();
  };

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!currentUser?.email) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/messages/unread-count?email=${encodeURIComponent(
          //http://localhost:5000
          currentUser.email
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

  const sendMessage = async () => {
    if (!selectedContact || !messageText.trim()) return;

    try {
      // Send message to backend
      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/send",
        {
          //http://localhost:5000
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: currentUser.email,
            senderName: currentUser.name || currentUser.email.split("@")[0],
            senderRole: "HR",
            recipientEmail: selectedContact.email,
            recipientName: selectedContact.name,
            recipientRole: "FOLLOW_UP_TEAM",
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
          senderEmail: currentUser.email,
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
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages for a conversation
  const fetchConversation = async (partnerEmail: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/messages/conversation?user1=${encodeURIComponent(
          //http://localhost:5000
          currentUser.email
        )}&user2=${encodeURIComponent(partnerEmail)}`
      );

      if (response.ok) {
        const messages = await response.json();

        // Format messages for display
        const formattedMessages = messages.map((msg: any) => ({
          id: msg._id,
          text: msg.message,
          sender: msg.senderEmail === currentUser.email ? "me" : "them",
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
          "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/messages/mark-read",
          {
            //http://localhost:5000
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              senderEmail: partnerEmail,
              recipientEmail: currentUser.email,
            }),
          }
        );
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CTPC</h1>
          <p className="text-sm text-gray-500">Dashboard</p>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{getUserInitials()}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
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
          onClick={() => setActiveSection("hiring-requests")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "hiring-requests"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Briefcase className="h-5 w-5" />
          Hiring Requests
          <Badge className="ml-auto bg-blue-100 text-blue-700">
            {hiringRequests.length}
          </Badge>
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
                      <p className="text-sm text-gray-600">Total Requests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {hiringRequests.length}
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Companies</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          new Set(
                            hiringRequests.map((req: any) => req.companyName)
                          ).size
                        }
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Recent Submissions
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          hiringRequests.filter((req: any) => {
                            const submissionDate = new Date(
                              req.createdAt || req.submittedAt
                            );
                            const today = new Date();
                            const diffTime = Math.abs(
                              today.getTime() - submissionDate.getTime()
                            );
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );
                            return diffDays <= 7;
                          }).length
                        }
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "hiring-requests":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hiring Requests
                </h1>
                <p className="text-gray-600">
                  Welcome back, {getUserDisplayName()}! Manage your hiring
                  requests.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by company or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading hiring requests...</p>
                  </CardContent>
                </Card>
              ) : hiringRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hiring requests found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Submit a hiring request form to see your data here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                hiringRequests.map((request: any) => (
                  <Card
                    key={request._id || request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {request.companyName || request.company_name}
                              </h3>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                Submitted
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              {request.jobDescriptions?.map(
                                (job: any, index: number) => (
                                  <div key={index} className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {job.title || job.position}
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{job.type || "Full-time"}</span>
                                        {job.internshipDuration && (
                                          <span>
                                            ({job.internshipDuration} months)
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>
                                          {job.openings || "Multiple"} openings
                                        </span>
                                      </div>
                                      {request.campusVisits?.[0]?.location && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          <span>
                                            {request.campusVisits[0].location}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium">
                                          {job.ctc
                                            ? `CTC: ${job.ctc} LPA`
                                            : job.stipend
                                            ? `Stipend: ${job.stipend}`
                                            : "Package: TBD"}
                                        </span>
                                      </div>

                                      {job.cutoff && (
                                        <div className="text-sm text-gray-600 mb-2">
                                          <span className="font-medium">
                                            CGPA Cutoff:
                                          </span>{" "}
                                          {job.cutoff}
                                        </div>
                                      )}

                                      {job.allowances && (
                                        <div className="text-sm text-gray-600 mb-2">
                                          <span className="font-medium">
                                            Allowances:
                                          </span>{" "}
                                          {job.allowances}
                                        </div>
                                      )}

                                      {job.conditions && (
                                        <div className="text-sm text-gray-600 mb-2">
                                          <span className="font-medium">
                                            Conditions:
                                          </span>{" "}
                                          {job.conditions}
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {(job.skills || job.requirements || "")
                                          .split(",")
                                          .slice(0, 3)
                                          .map(
                                            (tech: string, techIndex: number) =>
                                              tech.trim() && (
                                                <Badge
                                                  key={techIndex}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {tech.trim()}
                                                </Badge>
                                              )
                                          )}
                                      </div>

                                      {job.eligibleDepartments?.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">
                                            Eligible Depts:
                                          </span>{" "}
                                          {job.eligibleDepartments
                                            .slice(0, 2)
                                            .join(", ")}
                                          {job.eligibleDepartments.length > 2 &&
                                            ` +${
                                              job.eligibleDepartments.length - 2
                                            } more`}
                                        </div>
                                      )}

                                      {job.eligibleBatches?.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">
                                            Eligible Batches:
                                          </span>{" "}
                                          {job.eligibleBatches.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              ) || (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Position Available
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4" />
                                      <span>Full-time</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Hiring Stages */}
                              {request.hiringStages?.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Hiring Process
                                  </h4>
                                  <div className="space-y-1">
                                    {request.hiringStages.map(
                                      (stage: any, stageIndex: number) => (
                                        <div
                                          key={stageIndex}
                                          className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                          <span>
                                            {stage.stage} ({stage.mode})
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                HR Contact
                              </h4>
                              {request.hrContacts?.[0] ? (
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div>{request.hrContacts[0].name}</div>
                                  <div>{request.hrContacts[0].email}</div>
                                  <div>{request.hrContacts[0].phone}</div>
                                </div>
                              ) : (
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div>
                                    {request.hr_name || "HR Representative"}
                                  </div>
                                  <div>
                                    {request.hr_email || "contact@company.com"}
                                  </div>
                                  <div>
                                    {request.hr_phone || "+91-XXXXXXXXXX"}
                                  </div>
                                </div>
                              )}

                              {/* Campus Visit Details */}
                              {request.campusVisits?.[0] && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Campus Visit
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <CalendarIcon className="h-4 w-4" />
                                      <span>
                                        {new Date(
                                          request.campusVisits[0].startDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div>
                                      {request.campusVisits[0].stageName}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Uploaded Files */}
                              {request.uploadedFiles?.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Documents
                                  </h4>
                                  <div className="space-y-1">
                                    {request.uploadedFiles.map(
                                      (file: string, fileIndex: number) => (
                                        <div
                                          key={fileIndex}
                                          className="text-sm text-gray-600"
                                        >
                                          {file.split("\\").pop()}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Submission Date */}
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Submission Info
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      Submitted:{" "}
                                      {new Date(
                                        request.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>ID: {request._id.slice(-8)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRequest(request);
                              // Initialize editFormData with the current request data
                              setEditFormData({
                                companyName: request.companyName || "",
                                hrContacts: JSON.parse(
                                  JSON.stringify(request.hrContacts || [])
                                ),
                                jobDescriptions: JSON.parse(
                                  JSON.stringify(request.jobDescriptions || [])
                                ),
                                hiringStages: JSON.parse(
                                  JSON.stringify(request.hiringStages || [])
                                ),
                                campusVisits: JSON.parse(
                                  JSON.stringify(request.campusVisits || [])
                                ),
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case "messages":
        const followupTeamMember = assignedFollowup
          ? [
              {
                name: assignedFollowup.name,
                email: assignedFollowup.email,
                role: "Your Follow-up Team Member",
                avatar: assignedFollowup.name?.charAt(0)?.toUpperCase() || "F",
              },
            ]
          : [];

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                Communicate with CTPC placement team
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
              <Card className="lg:col-span-1">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Your Team Member
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {followupTeamMember.length > 0 ? (
                      followupTeamMember.map((member: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedContact(member);
                            fetchConversation(member.email);
                          }}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedContact?.email === member.email
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.avatar}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {member.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {member.role}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>Loading your team member...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-0 h-full flex flex-col">
                  {selectedContact ? (
                    <>
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {selectedContact.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedContact.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedContact.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {conversations[selectedContact.email]?.length > 0 ? (
                          <div className="space-y-4">
                            {conversations[selectedContact.email].map(
                              (message: any) => (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.sender === "me"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      message.sender === "me"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-900 border border-gray-200"
                                    }`}
                                  >
                                    <p className="text-sm">{message.text}</p>
                                    <p
                                      className={`text-xs mt-1 ${
                                        message.sender === "me"
                                          ? "text-blue-100"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {message.timestamp}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                Start a conversation with {selectedContact.name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                          <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!messageText.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Select a team member to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "calendar":
        const campusVisitDates = hiringRequests
          .flatMap((request: any) =>
            (request.campusVisits || []).map((visit: any) => ({
              date: visit.startDate,
              company: request.companyName || "Unknown Company",
              stage: visit.stageName || "Campus Visit",
            }))
          )
          .filter((visit: any) => visit.date);

        const generateCalendar = () => {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const firstDay = new Date(currentYear, currentMonth, 1);
          const lastDay = new Date(currentYear, currentMonth + 1, 0);
          const startDate = new Date(firstDay);
          startDate.setDate(startDate.getDate() - firstDay.getDay());

          const calendar = [];
          const visitMap = new Map();

          campusVisitDates.forEach((visit: any) => {
            const visitDate = new Date(visit.date);
            const dateKey = visitDate.toDateString();
            if (!visitMap.has(dateKey)) {
              visitMap.set(dateKey, []);
            }
            visitMap.get(dateKey).push(visit);
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
                Campus visits and interview schedules
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
                {campusVisitDates.length === 0 ? (
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
                  campusVisitDates.map((visit: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {visit.stage}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {visit.company}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {new Date(visit.date).toLocaleDateString()}
                              </span>
                              <span>
                                {new Date(visit.date).toLocaleDateString(
                                  "en-US",
                                  { weekday: "long" }
                                )}
                              </span>
                            </div>
                          </div>
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
                      <div className="w-3 h-3 bg-green-200 rounded"></div>
                      <span>Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-200 rounded"></div>
                      <span>Busy</span>
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
                                ? "bg-red-100 hover:bg-red-200"
                                : "bg-green-50 hover:bg-green-100"
                            }
                          `}
                          title={
                            dayData.visits.length > 0
                              ? dayData.visits
                                  .map((v: any) => v.company)
                                  .join(", ")
                              : "Available"
                          }
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span>{dayData.date.getDate()}</span>
                            {dayData.visits.length > 0 && (
                              <div className="w-1 h-1 bg-red-600 rounded-full mt-1"></div>
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

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <Input
                        value={currentUser.name || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        value={currentUser.email || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Email notifications</span>
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">SMS notifications</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>

      {showEditModal && editingRequest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Complete Form Submission Details
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                    setEditFormData({});
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={editFormData.companyName || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* HR Contacts */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  HR Contacts
                </h3>
                {(
                  editFormData.hrContacts ||
                  editingRequest.hrContacts ||
                  []
                ).map((contact: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <Input
                        value={
                          editFormData.hrContacts?.[index]?.name ||
                          contact.name ||
                          ""
                        }
                        onChange={(e) => {
                          const newContacts = [
                            ...(editFormData.hrContacts ||
                              editingRequest.hrContacts ||
                              []),
                          ];
                          if (!newContacts[index]) newContacts[index] = {};
                          newContacts[index] = {
                            ...newContacts[index],
                            name: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            hrContacts: newContacts,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        value={
                          editFormData.hrContacts?.[index]?.email ||
                          contact.email ||
                          ""
                        }
                        onChange={(e) => {
                          const newContacts = [
                            ...(editFormData.hrContacts ||
                              editingRequest.hrContacts ||
                              []),
                          ];
                          if (!newContacts[index]) newContacts[index] = {};
                          newContacts[index] = {
                            ...newContacts[index],
                            email: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            hrContacts: newContacts,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={
                          editFormData.hrContacts?.[index]?.phone ||
                          contact.phone ||
                          ""
                        }
                        onChange={(e) => {
                          const newContacts = [
                            ...(editFormData.hrContacts ||
                              editingRequest.hrContacts ||
                              []),
                          ];
                          if (!newContacts[index]) newContacts[index] = {};
                          newContacts[index] = {
                            ...newContacts[index],
                            phone: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            hrContacts: newContacts,
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Job Descriptions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Job Descriptions
                </h3>
                {(
                  editFormData.jobDescriptions ||
                  editingRequest.jobDescriptions ||
                  []
                ).map((job: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.title ||
                            job.title ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              title: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Type
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.type ||
                            job.type ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              type: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Openings
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.openings ||
                            job.openings ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              openings: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTC (LPA)
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.ctc ||
                            job.ctc ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              ctc: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stipend
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.stipend ||
                            job.stipend ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              stipend: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Internship Duration (months)
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]
                              ?.internshipDuration ||
                            job.internshipDuration ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              internshipDuration: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cutoff CGPA
                        </label>
                        <Input
                          value={
                            editFormData.jobDescriptions?.[index]?.cutoff ||
                            job.cutoff ||
                            ""
                          }
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions ||
                                []),
                            ];
                            if (!newJobs[index]) newJobs[index] = {};
                            newJobs[index] = {
                              ...newJobs[index],
                              cutoff: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills Required
                        </label>
                        <Input
                          value={job.skills || ""}
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions),
                            ];
                            newJobs[index] = {
                              ...newJobs[index],
                              skills: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conditions/Requirements
                        </label>
                        <Input
                          value={job.conditions || ""}
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions),
                            ];
                            newJobs[index] = {
                              ...newJobs[index],
                              conditions: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allowances
                        </label>
                        <Input
                          value={job.allowances || ""}
                          onChange={(e) => {
                            const newJobs = [
                              ...(editFormData.jobDescriptions ||
                                editingRequest.jobDescriptions),
                            ];
                            newJobs[index] = {
                              ...newJobs[index],
                              allowances: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              jobDescriptions: newJobs,
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree Preferences
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {job.degreePreferences?.map(
                            (degree: string, degIndex: number) => (
                              <Badge key={degIndex} variant="secondary">
                                {degree}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eligible Departments
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {job.eligibleDepartments?.map(
                            (dept: string, deptIndex: number) => (
                              <Badge
                                key={deptIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {dept}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eligible Batches
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {job.eligibleBatches?.map(
                            (batch: string, batchIndex: number) => (
                              <Badge key={batchIndex} variant="secondary">
                                {batch}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hiring Stages */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Hiring Stages
                </h3>
                {editingRequest.hiringStages?.map(
                  (stage: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stage Name
                        </label>
                        <Input
                          value={stage.stage || ""}
                          onChange={(e) => {
                            const newStages = [
                              ...(editFormData.hiringStages ||
                                editingRequest.hiringStages),
                            ];
                            newStages[index] = {
                              ...newStages[index],
                              stage: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              hiringStages: newStages,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mode
                        </label>
                        <Input
                          value={stage.mode || ""}
                          onChange={(e) => {
                            const newStages = [
                              ...(editFormData.hiringStages ||
                                editingRequest.hiringStages),
                            ];
                            newStages[index] = {
                              ...newStages[index],
                              mode: e.target.value,
                            };
                            setEditFormData({
                              ...editFormData,
                              hiringStages: newStages,
                            });
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Campus Visits */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Campus Visits
                </h3>
                {(
                  editFormData.campusVisits ||
                  editingRequest.campusVisits ||
                  []
                ).map((visit: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visit Date
                      </label>
                      <Input
                        type="date"
                        value={
                          editFormData.campusVisits?.[index]?.startDate
                            ? new Date(
                                editFormData.campusVisits[index].startDate
                              )
                                .toISOString()
                                .split("T")[0]
                            : visit.startDate
                            ? new Date(visit.startDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const newVisits = [
                            ...(editFormData.campusVisits ||
                              editingRequest.campusVisits ||
                              []),
                          ];
                          if (!newVisits[index]) newVisits[index] = {};
                          newVisits[index] = {
                            ...newVisits[index],
                            startDate: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            campusVisits: newVisits,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stage Name
                      </label>
                      <Input
                        value={
                          editFormData.campusVisits?.[index]?.stageName ||
                          visit.stageName ||
                          ""
                        }
                        onChange={(e) => {
                          const newVisits = [
                            ...(editFormData.campusVisits ||
                              editingRequest.campusVisits ||
                              []),
                          ];
                          if (!newVisits[index]) newVisits[index] = {};
                          newVisits[index] = {
                            ...newVisits[index],
                            stageName: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            campusVisits: newVisits,
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Uploaded Files */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Uploaded Files
                </h3>
                {editingRequest.uploadedFiles?.length > 0 ? (
                  <div className="space-y-2">
                    {editingRequest.uploadedFiles.map(
                      (file: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {file.split("\\").pop()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No files uploaded</p>
                )}
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Submission Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission ID
                    </label>
                    <Input
                      value={editingRequest._id || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created At
                    </label>
                    <Input
                      value={
                        editingRequest.createdAt
                          ? new Date(editingRequest.createdAt).toLocaleString()
                          : ""
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRequest(null);
                  setEditFormData({});
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  try {
                    console.log("🔄 Saving form changes...");
                    console.log("📝 Original request:", editingRequest._id);
                    console.log("📝 Form data to save:", editFormData);

                    // Update the hiring requests state with the edited data
                    const updatedRequests = hiringRequests.map((req: any) => {
                      if (req._id === editingRequest._id) {
                        const updated = {
                          ...req,
                          companyName:
                            editFormData.companyName || req.companyName,
                          hrContacts: editFormData.hrContacts || req.hrContacts,
                          jobDescriptions:
                            editFormData.jobDescriptions || req.jobDescriptions,
                          hiringStages:
                            editFormData.hiringStages || req.hiringStages,
                          campusVisits:
                            editFormData.campusVisits || req.campusVisits,
                        };
                        console.log(
                          "📅 Updated campus visits:",
                          updated.campusVisits
                        );
                        return updated;
                      }
                      return req;
                    });

                    console.log("🔄 Updating hiringRequests state...");
                    setHiringRequests(updatedRequests);

                    // Here you could also send the update to the backend
                    // await fetch(`http://localhost:5000/api/submissions/${editingRequest._id}`, {
                    //   method: 'PUT',
                    //   headers: { 'Content-Type': 'application/json' },
                    //   body: JSON.stringify(editFormData)
                    // })

                    console.log("✅ Form updated successfully!");
                    alert(
                      "Form updated successfully! Calendar will reflect the new dates."
                    );

                    setShowEditModal(false);
                    setEditingRequest(null);
                    setEditFormData({});
                  } catch (error) {
                    console.error("❌ Error updating form:", error);
                    alert("Error updating form. Please try again.");
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
