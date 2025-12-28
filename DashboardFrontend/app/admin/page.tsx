"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Users,
  Building,
  Briefcase,
  TrendingUp,
  Calendar as CalendarIcon,
  Settings,
  Shield,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  Filter,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State for different sections
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [hiringRequests, setHiringRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR",
    department: "",
    phone: "",
    company: "",
  });

  // Analytics filter state
  const [analyticsFilter, setAnalyticsFilter] = useState({
    view: "combined", // combined, followup, department
    selectedMember: "",
    selectedDepartment: "",
    dateRange: "all",
  });
  const [followupWorkload, setFollowupWorkload] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any>({});

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    // Fetch initial data based on active section
    fetchDataForSection(activeSection);
  }, [activeSection]);

  const fetchDataForSection = async (section: string) => {
    setLoading(true);
    try {
      switch (section) {
        case "overview":
          await fetchOverview();
          break;
        case "users":
          await fetchUsers();
          break;
        case "hiring-requests":
          await fetchHiringRequests();
          break;
        case "analytics":
          await fetchAnalytics();
          break;
        case "calendar":
          await fetchCalendar();
          break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/overview`
      ); //http://localhost:5001/api/admin/overview
      const data = await response.json();
      setOverviewStats(data);
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchHiringRequests = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/hiring-requests`
      );
      const data = await response.json();
      setHiringRequests(data);
    } catch (error) {
      console.error("Error fetching hiring requests:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/analytics`
      );
      const data = await response.json();
      setAnalytics(data);

      // Fetch followup workload directly from FormBackend team-progress endpoint (same as followup dashboard)
      const workloadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team/team-progress`
      );
      const workloadData = await workloadResponse.json();
      console.log("📊 Team progress data from FormBackend:", workloadData);

      // Transform the data to match our expected format
      const transformedWorkload = workloadData.map((member: any) => ({
        name: member.name,
        email: member.email,
        totalAssignments: member.totalAssigned || 0,
        completed: member.completed || 0,
        pending: member.pending || 0,
        overdue: 0, // Can be calculated later if needed
      }));

      console.log("📊 Transformed workload data:", transformedWorkload);
      setFollowupWorkload(transformedWorkload);

      // Calculate department stats from hiring requests
      const requestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/hiring-requests`
      );
      const requestsData = await requestsResponse.json();
      console.log(
        "📊 Hiring requests for department stats:",
        requestsData.length
      );
      calculateDepartmentStats(requestsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set default empty array if fetch fails
      setFollowupWorkload([]);
    }
  };

  const calculateDepartmentStats = (requests: any[]) => {
    const deptMap: any = {};

    console.log(
      "📊 Calculating department stats from",
      requests.length,
      "requests"
    );

    requests.forEach((request) => {
      request.jobDescriptions?.forEach((job: any) => {
        job.eligibleDepartments?.forEach((dept: string) => {
          if (!deptMap[dept]) {
            deptMap[dept] = {
              companies: new Set(),
              internships: 0,
              fulltime: 0,
              totalOpenings: 0,
            };
          }

          deptMap[dept].companies.add(request.companyName);
          if (job.type === "internship") {
            deptMap[dept].internships += parseInt(job.openings) || 0;
          } else {
            deptMap[dept].fulltime += parseInt(job.openings) || 0;
          }
          deptMap[dept].totalOpenings += parseInt(job.openings) || 0;
        });
      });
    });

    // Convert Set to count
    const finalStats: any = {};
    Object.keys(deptMap).forEach((dept) => {
      finalStats[dept] = {
        ...deptMap[dept],
        companies: deptMap[dept].companies.size,
      };
    });

    console.log(
      "📊 Department stats calculated:",
      Object.keys(finalStats).length,
      "departments",
      finalStats
    );
    setDepartmentStats(finalStats);
  };

  const fetchCalendar = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/calendar`
      );
      const data = await response.json();
      setCalendarEvents(data);
    } catch (error) {
      console.error("Error fetching calendar:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserData),
        }
      );

      if (response.ok) {
        alert("User created successfully!");
        setShowUserModal(false);
        setNewUserData({
          name: "",
          email: "",
          password: "",
          role: "HR",
          department: "",
          phone: "",
          company: "",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${editingUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserData),
        }
      );

      if (response.ok) {
        alert("User updated successfully!");
        setShowUserModal(false);
        setEditingUser(null);
        setNewUserData({
          name: "",
          email: "",
          password: "",
          role: "HR",
          department: "",
          phone: "",
          company: "",
        });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const openEditUserModal = (user: any) => {
    setEditingUser(user);
    setNewUserData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
      role: user.role || "HR",
      department: user.department || "",
      phone: user.phone || "",
      company: user.company || "",
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleDeleteHiringRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this hiring request?"))
      return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/hiring-requests/${requestId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Hiring request deleted successfully!");
        fetchHiringRequests();
      }
    } catch (error) {
      console.error("Error deleting hiring request:", error);
      alert("Failed to delete hiring request");
    }
  };

  // Download functions
  const downloadAsPNG = async () => {
    const element = document.getElementById("analytics-content");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      alert("Failed to download as PNG. Please install html2canvas package.");
    }
  };

  const downloadAsJPG = async () => {
    const element = document.getElementById("analytics-content");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `analytics-${new Date().toISOString().split("T")[0]}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch (error) {
      alert("Failed to download as JPG. Please install html2canvas package.");
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById("analytics-content");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`analytics-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      alert(
        "Failed to download as PDF. Please install jspdf and html2canvas packages."
      );
    }
  };

  const downloadAsWord = () => {
    let content =
      '<html><head><meta charset="utf-8"><title>Analytics Report</title></head><body>';
    content += "<h1>Analytics & Reports</h1>";
    content += `<p>Generated on: ${new Date().toLocaleDateString()}</p><hr/>`;

    if (analytics) {
      content += "<h2>Summary</h2>";
      content += `<p>Total Companies: ${
        analytics.summary?.totalCompanies || 0
      }</p>`;
      content += `<p>Total Departments: ${
        analytics.summary?.totalDepartments || 0
      }</p>`;
      content += `<p>Total Openings: ${
        analytics.summary?.totalOpenings || 0
      }</p>`;

      content += "<h2>Package Distribution</h2><ul>";
      Object.entries(analytics.packageRanges || {}).forEach(
        ([range, count]) => {
          content += `<li>${range}: ${count}</li>`;
        }
      );
      content += "</ul>";

      content += "<h2>Top Companies</h2><ul>";
      Object.entries(analytics.companyStats || {})
        .sort(([, a]: any, [, b]: any) => b.totalOpenings - a.totalOpenings)
        .slice(0, 10)
        .forEach(([company, stats]: [string, any]) => {
          content += `<li>${company}: ${stats.totalOpenings} openings (${stats.internships} internships, ${stats.fulltime} full-time)</li>`;
        });
      content += "</ul>";
    }

    content += "</body></html>";

    const blob = new Blob(["\ufeff", content], {
      type: "application/msword",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.doc`;
    link.click();
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CTPC Admin</h1>
          <p className="text-sm text-gray-500">System Control</p>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveSection("overview")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "overview"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Overview
        </button>

        <button
          onClick={() => setActiveSection("users")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "users"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Users className="h-5 w-5" />
          User Management
        </button>

        <button
          onClick={() => setActiveSection("hiring-requests")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "hiring-requests"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Briefcase className="h-5 w-5" />
          All Hiring Requests
        </button>

        <button
          onClick={() => setActiveSection("analytics")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "analytics"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          Analytics & Reports
        </button>

        <button
          onClick={() => setActiveSection("calendar")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "calendar"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          Master Calendar
        </button>

        <button
          onClick={() => setActiveSection("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "settings"
              ? "bg-red-50 text-red-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Settings className="h-5 w-5" />
          System Settings
        </button>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
          variant="outline"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Overview
              </h1>
              <p className="text-gray-600">
                Complete platform statistics and recent activity
              </p>
            </div>

            {overviewStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Users</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {overviewStats.stats.totalUsers}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        <div>HR: {overviewStats.stats.usersByRole.HR}</div>
                        <div>HOD: {overviewStats.stats.usersByRole.HOD}</div>
                        <div>
                          Follow-up:{" "}
                          {overviewStats.stats.usersByRole.FOLLOW_UP_TEAM}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Hiring Requests
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {overviewStats.stats.totalHiringRequests}
                          </p>
                        </div>
                        <Briefcase className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {overviewStats.stats.recentSubmissions} this week
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Active Companies
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {overviewStats.stats.activeCompanies}
                          </p>
                        </div>
                        <Building className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {overviewStats.stats.totalOpenings} total openings
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Campus Visits</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {overviewStats.stats.upcomingVisits}
                          </p>
                        </div>
                        <CalendarIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Upcoming</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {overviewStats.recentActivity.map(
                        (activity: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {activity.company}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {activity.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  activity.timestamp
                                ).toLocaleDateString()}
                              </p>
                              <Badge className="bg-green-100 text-green-700">
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600">Manage all platform users</p>
              </div>
              <Button
                onClick={() => setShowUserModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {users
                .filter(
                  (user) =>
                    user.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <Card key={user._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {user.name?.charAt(0) ||
                                user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.name || "Unnamed User"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge
                                className={`
                                ${
                                  user.role === "ADMIN"
                                    ? "bg-red-100 text-red-700"
                                    : ""
                                }
                                ${
                                  user.role === "HOD"
                                    ? "bg-purple-100 text-purple-700"
                                    : ""
                                }
                                ${
                                  user.role === "HR"
                                    ? "bg-blue-100 text-blue-700"
                                    : ""
                                }
                                ${
                                  user.role === "FOLLOW_UP_TEAM"
                                    ? "bg-green-100 text-green-700"
                                    : ""
                                }
                              `}
                              >
                                {user.role}
                              </Badge>
                              {user.department && (
                                <Badge variant="outline">
                                  {user.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditUserModal(user)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        );

      case "hiring-requests":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Hiring Requests
              </h1>
              <p className="text-gray-600">
                View and manage all hiring requests across departments
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {hiringRequests.map((request) => (
                <Card
                  key={request._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.companyName}
                          </h3>
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Positions</p>
                            <p className="font-medium">
                              {request.jobDescriptions?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Total Openings
                            </p>
                            <p className="font-medium">
                              {request.jobDescriptions?.reduce(
                                (sum: number, job: any) =>
                                  sum + (parseInt(job.openings) || 0),
                                0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Assigned Follow-up
                            </p>
                            {request.assignedFollowup ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-purple-700 font-medium">
                                    {request.assignedFollowup.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "F"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {request.assignedFollowup.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.assignedFollowup.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Not assigned
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-medium">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingRequest(request);
                            setShowRequestModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteHiringRequest(request._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics & Reports
                </h1>
                <p className="text-gray-600">
                  System-wide statistics and insights
                </p>
              </div>

              {/* Download Dropdown */}
              <div className="relative group">
                <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Report
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={downloadAsPDF}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Download as PDF
                  </button>
                  <button
                    onClick={downloadAsWord}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download as Word
                  </button>
                  <button
                    onClick={downloadAsPNG}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Download as PNG
                  </button>
                  <button
                    onClick={downloadAsJPG}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                  >
                    <svg
                      className="h-4 w-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Download as JPG
                  </button>
                </div>
              </div>
            </div>

            <div id="analytics-content">
              {/* Filter Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        View:
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="view"
                          value="combined"
                          checked={analyticsFilter.view === "combined"}
                          onChange={(e) =>
                            setAnalyticsFilter({
                              ...analyticsFilter,
                              view: e.target.value,
                            })
                          }
                          className="text-red-600"
                        />
                        <span className="text-sm text-gray-700">Combined</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="view"
                          value="followup"
                          checked={analyticsFilter.view === "followup"}
                          onChange={(e) =>
                            setAnalyticsFilter({
                              ...analyticsFilter,
                              view: e.target.value,
                            })
                          }
                          className="text-red-600"
                        />
                        <span className="text-sm text-gray-700">
                          Follow-up Team
                        </span>
                      </label>

                      {analyticsFilter.view === "followup" && (
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          value={analyticsFilter.selectedMember}
                          onChange={(e) =>
                            setAnalyticsFilter({
                              ...analyticsFilter,
                              selectedMember: e.target.value,
                            })
                          }
                        >
                          <option value="">Combined (All Members)</option>
                          <option value="aditya.followup@thapar.edu">
                            Aditya
                          </option>
                          <option value="shivam.followup@thapar.edu">
                            Shivam
                          </option>
                          <option value="akshay.followup@thapar.edu">
                            Akshay
                          </option>
                          {Array.isArray(followupWorkload) &&
                            followupWorkload
                              .filter(
                                (member) =>
                                  ![
                                    "aditya.followup@thapar.edu",
                                    "shivam.followup@thapar.edu",
                                    "akshay.followup@thapar.edu",
                                  ].includes(member.email)
                              )
                              .map((member: any) => (
                                <option key={member.email} value={member.email}>
                                  {member.name}
                                </option>
                              ))}
                        </select>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="view"
                          value="department"
                          checked={analyticsFilter.view === "department"}
                          onChange={(e) =>
                            setAnalyticsFilter({
                              ...analyticsFilter,
                              view: e.target.value,
                            })
                          }
                          className="text-red-600"
                        />
                        <span className="text-sm text-gray-700">
                          Department
                        </span>
                      </label>

                      {analyticsFilter.view === "department" && (
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          value={analyticsFilter.selectedDepartment}
                          onChange={(e) =>
                            setAnalyticsFilter({
                              ...analyticsFilter,
                              selectedDepartment: e.target.value,
                            })
                          }
                        >
                          <option value="">All Departments</option>
                          {Object.keys(departmentStats).map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analytics && (
                <>
                  {/* Combined View */}
                  {analyticsFilter.view === "combined" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Summary
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Total Companies
                                </span>
                                <span className="font-bold">
                                  {analytics.summary.totalCompanies}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Total Departments
                                </span>
                                <span className="font-bold">
                                  {analytics.summary.totalDepartments}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Total Openings
                                </span>
                                <span className="font-bold">
                                  {analytics.summary.totalOpenings}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Package Distribution
                            </h3>
                            <div className="space-y-3">
                              {Object.entries(analytics.packageRanges).map(
                                ([range, count]: [string, any]) => {
                                  const maxValue = Math.max(
                                    ...Object.values(
                                      analytics.packageRanges
                                    ).map((v) => Number(v))
                                  );
                                  const percentage =
                                    (Number(count) / maxValue) * 100;
                                  return (
                                    <div
                                      key={range}
                                      className="flex items-center gap-3"
                                    >
                                      <span className="text-sm text-gray-600 w-24">
                                        {range}
                                      </span>
                                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                                        <div
                                          className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                                          style={{ width: `${percentage}%` }}
                                        >
                                          <span className="text-xs text-white font-medium">
                                            {count}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Top Companies by Openings
                          </h3>
                          <div className="space-y-3">
                            {Object.entries(analytics.companyStats)
                              .sort(
                                ([, a]: any, [, b]: any) =>
                                  b.totalOpenings - a.totalOpenings
                              )
                              .slice(0, 10)
                              .map(([company, stats]: [string, any]) => (
                                <div
                                  key={company}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {company}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {stats.internships} internships,{" "}
                                      {stats.fulltime} full-time
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    {stats.totalOpenings} openings
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Follow-up Team View */}
                  {analyticsFilter.view === "followup" && (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Follow-up Team Workload
                            {analyticsFilter.selectedMember
                              ? ` - ${
                                  Array.isArray(followupWorkload)
                                    ? followupWorkload.find(
                                        (m) =>
                                          m.email ===
                                          analyticsFilter.selectedMember
                                      )?.name
                                    : ""
                                }`
                              : " - Combined (All Members)"}
                          </h3>
                          <div className="space-y-4">
                            {!Array.isArray(followupWorkload) ||
                            followupWorkload.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p>No follow-up team workload data available</p>
                                <p className="text-sm mt-2">
                                  Data will appear once follow-up assignments
                                  are made
                                </p>
                              </div>
                            ) : (
                              followupWorkload
                                .filter(
                                  (member) =>
                                    !analyticsFilter.selectedMember ||
                                    member.email ===
                                      analyticsFilter.selectedMember
                                )
                                .map((member: any) => {
                                  const maxAssignments = Math.max(
                                    ...followupWorkload.map(
                                      (m) => m.totalAssignments || 0
                                    )
                                  );
                                  const percentage =
                                    maxAssignments > 0
                                      ? ((member.totalAssignments || 0) /
                                          maxAssignments) *
                                        100
                                      : 0;

                                  return (
                                    <div
                                      key={member.email}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {member.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {member.email}
                                          </p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700">
                                          {member.totalAssignments || 0}{" "}
                                          assignments
                                        </Badge>
                                      </div>

                                      <div className="flex-1 bg-gray-200 rounded-full h-8">
                                        <div
                                          className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-8 rounded-full flex items-center px-3 gap-2"
                                          style={{ width: `${percentage}%` }}
                                        >
                                          <span className="text-xs text-white font-medium">
                                            {member.completed || 0} done
                                          </span>
                                          <span className="text-xs text-white">
                                            |
                                          </span>
                                          <span className="text-xs text-white font-medium">
                                            {member.pending || 0} pending
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-gray-600">
                                            Completed: {member.completed || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span className="text-gray-600">
                                            Pending: {member.pending || 0}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span className="text-gray-600">
                                            Overdue: {member.overdue || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Department View */}
                  {analyticsFilter.view === "department" && (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Department-wise Company Distribution
                            {analyticsFilter.selectedDepartment &&
                              ` - ${analyticsFilter.selectedDepartment}`}
                          </h3>
                          <div className="space-y-4">
                            {Object.entries(departmentStats)
                              .filter(
                                ([dept]) =>
                                  !analyticsFilter.selectedDepartment ||
                                  dept === analyticsFilter.selectedDepartment
                              )
                              .sort(
                                ([, a]: any, [, b]: any) =>
                                  b.companies - a.companies
                              )
                              .map(([dept, stats]: [string, any]) => {
                                const maxCompanies = Math.max(
                                  ...Object.values(departmentStats).map(
                                    (s: any) => s.companies
                                  )
                                );
                                const percentage =
                                  maxCompanies > 0
                                    ? (stats.companies / maxCompanies) * 100
                                    : 0;

                                return (
                                  <div key={dept} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {dept}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {stats.internships} internships,{" "}
                                          {stats.fulltime} full-time positions
                                        </p>
                                      </div>
                                      <Badge className="bg-purple-100 text-purple-700">
                                        {stats.companies} companies
                                      </Badge>
                                    </div>

                                    <div className="flex-1 bg-gray-200 rounded-full h-8">
                                      <div
                                        className="bg-purple-600 h-8 rounded-full flex items-center justify-between px-3"
                                        style={{ width: `${percentage}%` }}
                                      >
                                        <span className="text-xs text-white font-medium">
                                          {stats.totalOpenings} openings
                                        </span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                      <div>Companies: {stats.companies}</div>
                                      <div>
                                        Internships: {stats.internships}
                                      </div>
                                      <div>Full-time: {stats.fulltime}</div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </CardContent>
                      </Card>

                      {!analyticsFilter.selectedDepartment &&
                        Object.keys(departmentStats).length > 0 && (
                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Department Comparison
                              </h3>
                              <p className="text-sm text-gray-500 mb-4">
                                Showing top 7 departments by company count
                              </p>
                              <div className="h-64 flex items-end justify-around gap-2 px-2">
                                {Object.entries(departmentStats)
                                  .filter(
                                    ([, stats]: [string, any]) =>
                                      stats.companies > 0
                                  )
                                  .sort(
                                    ([, a]: any, [, b]: any) =>
                                      b.companies - a.companies
                                  )
                                  .slice(0, 7)
                                  .map(([dept, stats]: [string, any]) => {
                                    const maxCompanies = Math.max(
                                      ...Object.values(departmentStats).map(
                                        (s: any) => s.companies
                                      ),
                                      1
                                    );
                                    const barHeight = Math.floor(
                                      (stats.companies / maxCompanies) * 180
                                    ); // 180px max height

                                    return (
                                      <div
                                        key={dept}
                                        className="flex-1 flex flex-col items-center gap-1 min-w-0"
                                      >
                                        <div
                                          className="w-full bg-blue-600 rounded-t-lg relative group cursor-pointer hover:bg-blue-700 transition-colors flex items-end justify-center pb-1"
                                          style={{
                                            height: `${barHeight}px`,
                                            minHeight:
                                              stats.companies > 0
                                                ? "40px"
                                                : "0px",
                                            maxWidth: "80px",
                                          }}
                                        >
                                          <span className="text-xs text-white font-bold">
                                            {stats.companies}
                                          </span>
                                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                                            <div className="font-semibold mb-1">
                                              {dept}
                                            </div>
                                            <div>
                                              {stats.companies} companies
                                            </div>
                                            <div>
                                              {stats.totalOpenings} openings
                                            </div>
                                            <div className="text-gray-300 text-xs mt-1">
                                              {stats.internships} internships,{" "}
                                              {stats.fulltime} full-time
                                            </div>
                                          </div>
                                        </div>
                                        <p
                                          className="text-xs text-gray-600 text-center mt-2 leading-tight"
                                          title={dept}
                                          style={{
                                            fontSize: "9px",
                                            maxWidth: "80px",
                                            lineHeight: "1.2",
                                            wordWrap: "break-word",
                                          }}
                                        >
                                          {dept.length > 25
                                            ? dept.substring(0, 23) + "..."
                                            : dept}
                                        </p>
                                      </div>
                                    );
                                  })}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Master Calendar
              </h1>
              <p className="text-gray-600">
                All campus visits across all departments
              </p>
            </div>

            <div className="space-y-4">
              {calendarEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No campus visits scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                calendarEvents
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                { month: "short" }
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {event.company}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {event.stage}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.departments.map(
                                (dept: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {dept}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Settings
              </h1>
              <p className="text-gray-600">Configure platform settings</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Platform Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <Input defaultValue="2025-2026" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Batch
                    </label>
                    <Input defaultValue="2026" />
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700">
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
                    <span className="text-gray-700">Email Notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">SMS Notifications</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">System Alerts</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-72">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeSection.charAt(0).toUpperCase() +
              activeSection.slice(1).replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <Badge className="bg-red-100 text-red-700">Administrator</Badge>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setNewUserData({
                    name: "",
                    email: "",
                    password: "",
                    role: "HR",
                    department: "",
                    phone: "",
                    company: "",
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    value={newUserData.name}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    type="email"
                    disabled={!!editingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingUser && "(leave blank to keep current)"}
                  </label>
                  <Input
                    value={newUserData.password}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        password: e.target.value,
                      })
                    }
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current"
                        : "Enter password"
                    }
                    type="password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={newUserData.role}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, role: e.target.value })
                    }
                  >
                    <option value="HR">HR</option>
                    <option value="HOD">HOD</option>
                    <option value="FOLLOW_UP_TEAM">Follow-up Team</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                    value={newUserData.department}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        department: e.target.value,
                      })
                    }
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    value={newUserData.phone}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <Input
                  value={newUserData.company}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, company: e.target.value })
                  }
                  placeholder="Company name (if HR)"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setNewUserData({
                      name: "",
                      email: "",
                      password: "",
                      role: "HR",
                      department: "",
                      phone: "",
                      company: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={editingUser ? handleEditUser : handleCreateUser}
                >
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {showRequestModal && viewingRequest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {viewingRequest.companyName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Complete Hiring Request Details
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRequestModal(false);
                    setViewingRequest(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Company Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Company Name</p>
                      <p className="font-medium text-gray-900">
                        {viewingRequest.companyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submission Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          viewingRequest.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Contacts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  HR Contacts
                </h3>
                <div className="space-y-3">
                  {viewingRequest.hrContacts?.map(
                    (contact: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">
                              {contact.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {contact.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Job Descriptions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Job Descriptions (
                  {viewingRequest.jobDescriptions?.length || 0} positions)
                </h3>
                <div className="space-y-4">
                  {viewingRequest.jobDescriptions?.map(
                    (job: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-purple-100 text-purple-700">
                            Position {index + 1}
                          </Badge>
                          <h4 className="font-semibold text-gray-900">
                            {job.title}
                          </h4>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Openings</p>
                            <p className="font-medium text-gray-900">
                              {job.openings}
                            </p>
                          </div>
                          {job.ctc && (
                            <div>
                              <p className="text-sm text-gray-600">CTC</p>
                              <p className="font-medium text-gray-900">
                                {job.ctc} LPA
                              </p>
                            </div>
                          )}
                          {job.stipend && (
                            <div>
                              <p className="text-sm text-gray-600">Stipend</p>
                              <p className="font-medium text-gray-900">
                                ₹{job.stipend}
                              </p>
                            </div>
                          )}
                          {job.cutoff && (
                            <div>
                              <p className="text-sm text-gray-600">
                                CGPA Cutoff
                              </p>
                              <p className="font-medium text-gray-900">
                                {job.cutoff}
                              </p>
                            </div>
                          )}
                        </div>

                        {job.skills && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Required Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.skills
                                .split(",")
                                .map((skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill.trim()}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}

                        {job.eligibleDepartments &&
                          job.eligibleDepartments.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">
                                Eligible Departments
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.eligibleDepartments.map(
                                  (dept: string, i: number) => (
                                    <Badge
                                      key={i}
                                      className="bg-blue-100 text-blue-700 text-xs"
                                    >
                                      {dept}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {job.conditions && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Conditions
                            </p>
                            <p className="text-sm text-gray-900">
                              {job.conditions}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Hiring Stages */}
              {viewingRequest.hiringStages &&
                viewingRequest.hiringStages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Hiring Process ({viewingRequest.hiringStages.length}{" "}
                      stages)
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {viewingRequest.hiringStages.map(
                          (stage: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-orange-700">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {stage.stage}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {stage.mode}
                                </Badge>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Campus Visits */}
              {viewingRequest.campusVisits &&
                viewingRequest.campusVisits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-red-600" />
                      Campus Visits
                    </h3>
                    <div className="space-y-3">
                      {viewingRequest.campusVisits.map(
                        (visit: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(
                                    visit.startDate
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    visit.startDate
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Stage</p>
                                <p className="font-medium text-gray-900">
                                  {visit.stageName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Uploaded Files */}
              {viewingRequest.uploadedFiles &&
                viewingRequest.uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Uploaded Documents
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {viewingRequest.uploadedFiles.map(
                          (file: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              {file.split("\\").pop()}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Request ID: {viewingRequest._id}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRequestModal(false);
                      setViewingRequest(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this request?")
                      ) {
                        handleDeleteHiringRequest(viewingRequest._id);
                        setShowRequestModal(false);
                        setViewingRequest(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
