// For Local run use http://localhost:5001 on ${process.env.NEXT_PUBLIC_API_BASE_URL}.
"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Building,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  Settings,
  Search,
  Filter,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  TrendingUp,
  Download,
  GraduationCap,
  CheckCircle,
} from "lucide-react";

export default function HODDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState({
    name: "HOD",
    email: "hod@thapar.edu",
    department: "",
  });
  const [loading, setLoading] = useState(true);

  // Data states
  const [companies, setCompanies] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState({
    totalCompanies: 0,
    totalOpenings: 0,
    totalPlacements: 0,
    avgPackage: 0,
    highestPackage: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (currentUser.department) {
      fetchAllData();
    }
  }, [currentUser.department]);

  const loadUserData = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "HOD",
          email: user.email || "hod@thapar.edu",
          department: user.department || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCompanies(),
        fetchAnalytics(),
        fetchCalendar(),
        fetchComparisonData(),
        fetchStudents(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/hod/companies?department=${encodeURIComponent(
          //http://localhost:5001
          currentUser.department
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        calculateDepartmentStats(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/hod/analytics?department=${encodeURIComponent(
          currentUser.department
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(null);
    }
  };

  const fetchCalendar = async () => {
    try {
      console.log(
        "🔍 Fetching calendar for department:",
        currentUser.department
      );
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/hod/calendar?department=${encodeURIComponent(
          currentUser.department
        )}`
      );
      console.log("📡 Calendar API response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("📅 Calendar events received:", data.length, data);
        setCalendarEvents(data);
      } else {
        console.error(
          "❌ Calendar API error:",
          response.status,
          response.statusText
        );
        setCalendarEvents([]);
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
      setCalendarEvents([]);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/comparison"
      );
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setComparisonData([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/hod/students?department=${encodeURIComponent(
          currentUser.department
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const calculateDepartmentStats = (companyData: any[]) => {
    let totalOpenings = 0;
    let totalPlacements = 0;
    let packages: number[] = [];

    companyData.forEach((company: any) => {
      company.jobDescriptions?.forEach((job: any) => {
        totalOpenings += parseInt(job.openings || 0);
        if (job.ctc) {
          packages.push(parseFloat(job.ctc));
        }
      });
    });

    const avgPackage =
      packages.length > 0
        ? packages.reduce((a, b) => a + b, 0) / packages.length
        : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    setDepartmentStats({
      totalCompanies: companyData.length,
      totalOpenings,
      totalPlacements: 0, // Will be calculated from actual placement data
      avgPackage: parseFloat(avgPackage.toFixed(2)),
      highestPackage,
    });
  };

  const getUserInitials = () => {
    const name = currentUser.name || currentUser.email || "HOD";
    return name.charAt(0).toUpperCase();
  };

  const getDepartmentShortName = () => {
    const dept = currentUser.department || "";
    if (dept.includes("CSED")) return "CSED";
    if (dept.includes("MED")) return "MED";
    if (dept.includes("EID")) return "EID";
    if (dept.includes("ECD")) return "ECD";
    if (dept.includes("CED")) return "CED";
    if (dept.includes("BTD")) return "BTD";
    if (dept.includes("CHED")) return "CHED";
    if (dept.includes("DEE")) return "DEE";
    return "DEPT";
  };

  // Download handlers
  const downloadDepartmentReport = () => {
    // Create a simple text report
    const reportData = `
DEPARTMENT PLACEMENT REPORT
Department: ${getDepartmentShortName()}
Generated: ${new Date().toLocaleDateString()}

STATISTICS:
- Total Companies: ${departmentStats.totalCompanies}
- Total Openings: ${departmentStats.totalOpenings}
- Average Package: ${departmentStats.avgPackage} LPA
- Highest Package: ${departmentStats.highestPackage} LPA

COMPANIES:
${companies
  .map(
    (c, i) =>
      `${i + 1}. ${c.companyName || c.hrContacts?.[0]?.name || "Company"}`
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getDepartmentShortName()}_Placement_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCompanyData = () => {
    // Create CSV data
    let csvContent = "Company,Position,Type,Openings,Package,CGPA Cutoff\n";

    companies.forEach((company) => {
      const companyName =
        company.companyName || company.hrContacts?.[0]?.name || "Company";
      company.jobDescriptions?.forEach((job: any) => {
        csvContent += `"${companyName}","${job.title}","${job.type}","${
          job.openings
        }","${job.ctc || job.stipend || "N/A"}","${job.cutoff || "N/A"}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getDepartmentShortName()}_Company_Data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadStudentList = () => {
    const reportData = `
STUDENT LIST - ${getDepartmentShortName()}
Generated: ${new Date().toLocaleDateString()}

Total Students: ${students.length}
Eligible: ${students.filter((s: any) => s.eligible).length}
Placed: ${students.filter((s: any) => s.placed).length}

Note: Student data will be available once student registration is implemented.
    `.trim();

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getDepartmentShortName()}_Student_List.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPackageAnalysis = () => {
    const packages = companies.flatMap(
      (c) =>
        c.jobDescriptions
          ?.filter((j: any) => j.ctc)
          .map((j: any) => parseFloat(j.ctc)) || []
    );

    let csvContent = "Metric,Value\n";
    csvContent += `Total Companies,${departmentStats.totalCompanies}\n`;
    csvContent += `Total Openings,${departmentStats.totalOpenings}\n`;
    csvContent += `Average Package,${departmentStats.avgPackage} LPA\n`;
    csvContent += `Highest Package,${departmentStats.highestPackage} LPA\n`;
    csvContent += `Lowest Package,${
      packages.length > 0 ? Math.min(...packages) : 0
    } LPA\n`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getDepartmentShortName()}_Package_Analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-gray-200">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CTPC HOD</h1>
          <p className="text-sm text-gray-500">{getDepartmentShortName()}</p>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{getUserInitials()}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveSection("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "dashboard"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveSection("companies")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "companies"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Building className="h-5 w-5" />
          Companies
          <Badge className="ml-auto bg-purple-100 text-purple-700">
            {companies.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveSection("calendar")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "calendar"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </button>

        <button
          onClick={() => setActiveSection("analytics")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "analytics"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          Analytics
        </button>

        <button
          onClick={() => setActiveSection("students")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "students"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Users className="h-5 w-5" />
          Student Overview
        </button>

        <button
          onClick={() => setActiveSection("reports")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "reports"
              ? "bg-purple-50 text-purple-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText className="h-5 w-5" />
          Reports
        </button>

        <button
          onClick={() => setActiveSection("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
            activeSection === "settings"
              ? "bg-purple-50 text-purple-700"
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
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome, {currentUser.name} - {getDepartmentShortName()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Companies</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {departmentStats.totalCompanies}
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Openings</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {departmentStats.totalOpenings}
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
                      <p className="text-sm text-gray-600">Avg Package</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {departmentStats.avgPackage} L
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Highest Package</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {departmentStats.highestPackage} L
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Companies
                  </h3>
                  <div className="space-y-3">
                    {companies
                      .slice(0, 5)
                      .map((company: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Building className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {company.companyName ||
                                  company.hrContacts?.[0]?.name ||
                                  "Company"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {company.jobDescriptions?.length || 0} positions
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upcoming Events
                  </h3>
                  <div className="space-y-3">
                    {calendarEvents
                      .slice(0, 5)
                      .map((event: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {event.company}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    {calendarEvents.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No upcoming events
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "companies":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
                <p className="text-gray-600">
                  Companies hiring from {getDepartmentShortName()}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading companies...</p>
                  </CardContent>
                </Card>
              ) : companies.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No companies found
                    </h3>
                    <p className="text-gray-500">
                      No companies are currently hiring from your department.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                companies
                  .filter((company: any) =>
                    company.companyName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((company: any) => (
                    <Card
                      key={company._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {company.companyName ||
                                    company.hrContacts?.[0]?.name ||
                                    "Company"}
                                </h3>
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                  Active
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                {company.jobDescriptions?.map(
                                  (job: any, index: number) => (
                                    <div key={index} className="mb-4">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        {job.title}
                                      </h4>
                                      <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                          <Briefcase className="h-4 w-4" />
                                          <span>{job.type}</span>
                                          {job.internshipDuration && (
                                            <span>
                                              ({job.internshipDuration} months)
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          <span>{job.openings} openings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-4 w-4" />
                                          <span>
                                            {job.ctc
                                              ? `${job.ctc} LPA`
                                              : job.stipend
                                              ? `₹${job.stipend}`
                                              : "TBD"}
                                          </span>
                                        </div>
                                        {job.cutoff && (
                                          <div className="text-sm">
                                            <span className="font-medium">
                                              CGPA:
                                            </span>{" "}
                                            {job.cutoff}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {(job.skills || "")
                                          .split(",")
                                          .slice(0, 3)
                                          .map(
                                            (skill: string, idx: number) =>
                                              skill.trim() && (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {skill.trim()}
                                                </Badge>
                                              )
                                          )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  HR Contact
                                </h4>
                                {company.hrContacts?.[0] && (
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div>{company.hrContacts[0].name}</div>
                                    <div>{company.hrContacts[0].email}</div>
                                    <div>{company.hrContacts[0].phone}</div>
                                  </div>
                                )}

                                {company.campusVisits?.[0] && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Campus Visit
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>
                                          {new Date(
                                            company.campusVisits[0].startDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div>
                                        {company.campusVisits[0].stageName}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        );

      case "calendar":
        console.log(
          "🗓️ Rendering calendar with events:",
          calendarEvents.length,
          calendarEvents
        );

        // Generate calendar grid
        const generateCalendar = () => {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const firstDay = new Date(currentYear, currentMonth, 1);
          const startDate = new Date(firstDay);
          startDate.setDate(startDate.getDate() - firstDay.getDay());

          const calendar = [];
          const visitMap = new Map();

          // Map ALL events to dates (including past events for calendar display)
          calendarEvents.forEach((event: any) => {
            if (!event.date) return;
            const eventDate = new Date(event.date);
            const dateKey = eventDate.toDateString();
            if (!visitMap.has(dateKey)) {
              visitMap.set(dateKey, []);
            }
            visitMap.get(dateKey).push(event);
          });

          console.log(
            "📍 Visit map size:",
            visitMap.size,
            "Keys:",
            Array.from(visitMap.keys()).slice(0, 5)
          );

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

        // Filter upcoming events (today and future) for sidebar only
        const upcomingEvents = calendarEvents
          .filter((event: any) => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 10); // Show only next 10 events

        console.log("⏭️ Upcoming events:", upcomingEvents.length);

        // Get events for today and tomorrow
        const todayEvents = calendarEvents.filter((event: any) => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        });

        const tomorrowEvents = calendarEvents.filter((event: any) => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return eventDate.toDateString() === tomorrow.toDateString();
        });

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">
                Campus visits for {getDepartmentShortName()}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Events Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Visits
                </h3>

                {/* Today's Events */}
                {todayEvents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700">
                        Today
                      </span>
                    </div>
                    {todayEvents.map((event: any, index: number) => (
                      <Card
                        key={index}
                        className="mb-2 border-l-4 border-red-500"
                      >
                        <CardContent className="p-3">
                          <p className="font-medium text-gray-900 text-sm">
                            {event.company || "Company"}
                          </p>
                          <p className="text-xs text-gray-600">{event.stage}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Tomorrow's Events */}
                {tomorrowEvents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700">
                        Tomorrow
                      </span>
                    </div>
                    {tomorrowEvents.map((event: any, index: number) => (
                      <Card
                        key={index}
                        className="mb-2 border-l-4 border-orange-500"
                      >
                        <CardContent className="p-3">
                          <p className="font-medium text-gray-900 text-sm">
                            {event.company || "Company"}
                          </p>
                          <p className="text-xs text-gray-600">{event.stage}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Other Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Coming Up
                      </span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {upcomingEvents.map((event: any, index: number) => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);

                        // Skip if it's today or tomorrow (already shown above)
                        if (
                          eventDate.toDateString() === today.toDateString() ||
                          eventDate.toDateString() === tomorrow.toDateString()
                        ) {
                          return null;
                        }

                        return (
                          <Card
                            key={index}
                            className="border-l-4 border-purple-500"
                          >
                            <CardContent className="p-3">
                              <p className="font-medium text-gray-900 text-sm">
                                {event.company || "Company"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {event.stage}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                                {" at "}
                                {new Date(event.date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show message when there are events but none upcoming */}
                {calendarEvents.length > 0 &&
                  upcomingEvents.length === 0 &&
                  todayEvents.length === 0 &&
                  tomorrowEvents.length === 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="text-center py-6">
                        <CalendarIcon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          All events are in the past
                        </h3>
                        <p className="text-xs text-gray-600">
                          {calendarEvents.length} campus visit
                          {calendarEvents.length > 1 ? "s" : ""} completed.
                          Check the calendar grid to see past events.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                {calendarEvents.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        No events scheduled
                      </h3>
                      <p className="text-xs text-gray-500">
                        Campus visits will appear here when scheduled.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[now.getMonth()]} {now.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-200 rounded"></div>
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
                            p-2 min-h-[80px] text-sm border rounded cursor-pointer transition-colors relative
                            ${
                              dayData.isCurrentMonth
                                ? "text-gray-900"
                                : "text-gray-300"
                            }
                            ${
                              dayData.isToday
                                ? "bg-blue-50 border-blue-300 font-semibold"
                                : "border-gray-200"
                            }
                            ${
                              dayData.isBusy
                                ? "bg-purple-50 hover:bg-purple-100"
                                : "bg-gray-50 hover:bg-gray-100"
                            }
                          `}
                          title={
                            dayData.visits.length > 0
                              ? dayData.visits
                                  .map(
                                    (v: any) =>
                                      `${v.company || "Company"} - ${v.stage}`
                                  )
                                  .join("\n")
                              : "No events"
                          }
                        >
                          <div className="font-medium mb-1">
                            {dayData.date.getDate()}
                          </div>
                          {dayData.visits.length > 0 && (
                            <div className="space-y-1">
                              {dayData.visits
                                .slice(0, 2)
                                .map((visit: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="text-xs bg-purple-200 text-purple-800 px-1 py-0.5 rounded truncate"
                                    title={`${visit.company || "Company"} - ${
                                      visit.stage
                                    }`}
                                  >
                                    {visit.company || "Company"}
                                  </div>
                                ))}
                              {dayData.visits.length > 2 && (
                                <div className="text-xs text-purple-600 font-medium">
                                  +{dayData.visits.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">
                Placement analytics for {getDepartmentShortName()}
              </p>
            </div>

            {/* Top Companies for Department */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Companies - {getDepartmentShortName()}
                </h3>
                {analytics?.topCompanies &&
                analytics.topCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topCompanies.map(
                      (company: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-8 text-gray-500 font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {company.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {company.openings} openings
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (company.openings /
                                      (analytics.topCompanies[0]?.openings ||
                                        1)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No analytics data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Department Comparison */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Department Comparison
                </h3>
                {comparisonData && comparisonData.length > 0 ? (
                  <div className="space-y-3">
                    {comparisonData.map((dept: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-gray-700">
                          {dept.shortName}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              {dept.companies} companies
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {dept.avgPackage} LPA avg
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                dept.department === currentUser.department
                                  ? "bg-purple-600"
                                  : "bg-blue-400"
                              }`}
                              style={{
                                width: `${
                                  (dept.companies /
                                    (Math.max(
                                      ...comparisonData.map(
                                        (d: any) => d.companies
                                      )
                                    ) || 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No comparison data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "students":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Overview
              </h1>
              <p className="text-gray-600">
                Student eligibility and placement status -{" "}
                {getDepartmentShortName()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Eligible Students</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {students.filter((s: any) => s.eligible).length}
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
                      <p className="text-sm text-gray-600">Placed</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {students.filter((s: any) => s.placed).length}
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
                      <p className="text-sm text-gray-600">Placement %</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {students.length > 0
                          ? Math.round(
                              (students.filter((s: any) => s.placed).length /
                                students.length) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Batch-wise Breakdown
                </h3>
                <div className="text-gray-500 text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-medium mb-2">No student data available</p>
                  <p className="text-sm">
                    Student data will be displayed here once student
                    registration is implemented.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">
                Download placement reports - {getDepartmentShortName()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Department Placement Report
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Complete placement statistics for{" "}
                        {getDepartmentShortName()}
                      </p>
                      <Button
                        onClick={downloadDepartmentReport}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Company-wise Data
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Detailed breakdown by company and position
                      </p>
                      <Button
                        onClick={downloadCompanyData}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Student List
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        List of eligible and placed students
                      </p>
                      <Button
                        onClick={downloadStudentList}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Package Analysis
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Salary trends and package distribution
                      </p>
                      <Button
                        onClick={downloadPackageAnalysis}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your preferences</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input value={currentUser.name} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input value={currentUser.email} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input value={currentUser.department} disabled />
                  </div>
                  <p className="text-sm text-gray-500">
                    Contact CTPC admin to update your information
                  </p>
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {getDepartmentShortName()} Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-100 text-purple-700">
              Read-Only Access
            </Badge>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
