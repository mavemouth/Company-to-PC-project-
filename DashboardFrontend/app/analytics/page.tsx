"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  BarChart3,
  Download,
  Filter,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  FileImage,
  FileText,
} from "lucide-react";

export default function AnalyticsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [yearRange, setYearRange] = useState({ from: "2023", to: "2025" });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      setUserData(JSON.parse(userDataStr));
    }
  }, []);

  // Mock data for analytics
  const teamPerformanceData = [
    {
      name: "Aditya Sagar",
      tasksCompleted: 45,
      companiesHandled: 12,
      efficiency: 92,
    },
    {
      name: "Jessica Kamboj",
      tasksCompleted: 52,
      companiesHandled: 15,
      efficiency: 88,
    },
    {
      name: "Khushi Chhabra",
      tasksCompleted: 38,
      companiesHandled: 10,
      efficiency: 85,
    },
    {
      name: "Akshay Kumar",
      tasksCompleted: 41,
      companiesHandled: 11,
      efficiency: 90,
    },
  ];

  const topCompaniesData = [
    { name: "Microsoft", placements: 25, avgPackage: "18 LPA" },
    { name: "Google", placements: 15, avgPackage: "22 LPA" },
    { name: "Amazon", placements: 20, avgPackage: "16 LPA" },
    { name: "TCS", placements: 45, avgPackage: "8 LPA" },
    { name: "Infosys", placements: 35, avgPackage: "9 LPA" },
  ];

  const departmentData = [
    { name: "Computer Science", companies: 25, placements: 120 },
    { name: "Electronics", companies: 18, placements: 85 },
    { name: "Mechanical", companies: 15, placements: 65 },
    { name: "Civil", companies: 12, placements: 45 },
  ];

  const downloadChart = (format: "png" | "jpg" | "pdf") => {
    // In a real application, you would use a library like html2canvas or jsPDF
    // For demo purposes, we'll just show an alert
    alert(`Downloading chart as ${format.toUpperCase()}...`);

    // Simulate download
    const link = document.createElement("a");
    link.download = `analytics-${selectedYear}-${format}`;
    link.href = "#"; // In real app, this would be the generated image/PDF blob URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!userData) {
    return <div className="p-6">Loading...</div>;
  }

  // Only show analytics for team-member and admin roles
  if (userData.role !== "team-member" && userData.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Not Available
            </h3>
            <p className="text-gray-600">
              Analytics are only available for Team Members and Admins.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Performance graphs and insights with downloadable reports
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cse">Computer Science</SelectItem>
              <SelectItem value="ece">Electronics</SelectItem>
              <SelectItem value="mech">Mechanical</SelectItem>
              <SelectItem value="civil">Civil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Download Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Download Reports</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadChart("png")}
                className="flex items-center gap-1"
              >
                <FileImage className="h-3 w-3" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadChart("jpg")}
                className="flex items-center gap-1"
              >
                <FileImage className="h-3 w-3" />
                JPG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadChart("pdf")}
                className="flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Performance
          </CardTitle>
          <CardDescription>
            Individual work metrics and efficiency ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="space-y-4">
            {teamPerformanceData.map((member, index) => (
              <div key={member.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    {member.efficiency}% Efficiency
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tasks Completed</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(member.tasksCompleted / 60) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">
                        {member.tasksCompleted}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600">Companies Handled</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(member.companiesHandled / 20) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">
                        {member.companiesHandled}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600">Efficiency Rating</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${member.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{member.efficiency}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Companies Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top Companies ({yearRange.from} - {yearRange.to})
          </CardTitle>
          <CardDescription>
            Companies with highest placements and packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCompaniesData.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {company.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Avg Package: {company.avgPackage}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg text-blue-600">
                    {company.placements}
                  </p>
                  <p className="text-sm text-gray-600">Placements</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Wise Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Department Analytics
          </CardTitle>
          <CardDescription>
            Performance by department for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {dept.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Companies</span>
                    <span className="font-medium">{dept.companies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Placements</span>
                    <span className="font-medium text-green-600">
                      {dept.placements}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${(dept.placements / 150) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {teamPerformanceData.reduce(
                (sum, member) => sum + member.tasksCompleted,
                0
              )}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {topCompaniesData.reduce(
                (sum, company) => sum + company.placements,
                0
              )}
            </div>
            <div className="text-sm text-gray-600">Total Placements</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {topCompaniesData.length}
            </div>
            <div className="text-sm text-gray-600">Active Companies</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                teamPerformanceData.reduce(
                  (sum, member) => sum + member.efficiency,
                  0
                ) / teamPerformanceData.length
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Efficiency</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
