"use client"

import type React from "react"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Upload,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  ChevronDown,
  Eye,
  ArrowLeft,
  Search,
  MoreHorizontal,
} from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { UserProfileDropdown } from "@/components/user-profile-dropdown"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { useUser } from "@/components/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const teamMembers = [
  { name: "Aditya Sagar Singh", email: "aditya@hirehub.com", role: "Team Member" as const, initials: "AS" },
  { name: "Jessica Kamboj", email: "jessica@hirehub.com", role: "Team Member" as const, initials: "JK" },
  { name: "Khushi Chhabra", email: "khushi@hirehub.com", role: "Team Member" as const, initials: "KC" },
  { name: "Akshay Kumar Roy", email: "akshay@hirehub.com", role: "Team Member" as const, initials: "AR" },
]

const hrManagerRequests = [
  {
    id: "TU-2025-0001",
    company: "Apple Inc.",
    position: "iOS Developer",
    assignedTo: "HireHub Team",
    deadline: "2025-02-15",
    status: "In Progress",
    priority: "High",
    type: "Full-Time",
    location: "Bengaluru, India",
    salaryRange: "₹25,00,000 - ₹35,00,000",
    year: 2025,
    performanceRating: "Excellent",
  },
  {
    id: "TU-2025-0009",
    company: "Apple Inc.",
    position: "Apple Silicon Engineer",
    assignedTo: "HireHub Team",
    deadline: "2025-03-01",
    status: "Pending",
    priority: "Medium",
    type: "Full-Time",
    location: "Hyderabad, India",
    salaryRange: "₹30,00,000 - ₹40,00,000",
    year: 2025,
    performanceRating: "Good",
  },
]

const initialRequests = [
  {
    id: "TU-2025-0001",
    company: "Apple Inc.",
    position: "iOS Developer",
    location: "Bengaluru, India",
    salaryRange: "₹25,00,000 - ₹35,00,000",
    status: "In Review",
    priority: "High",
    type: "Full-Time",
    deadline: "2/15/2025",
    assignedTo: "Aditya Sagar Singh",
    year: 2025,
    performanceRating: "Excellent",
  },
  {
    id: "TU-2024-0002",
    company: "Microsoft Corporation",
    position: "Product Manager",
    location: "Hyderabad, India",
    salaryRange: "₹20,00,000 - ₹30,00,000",
    status: "Pending",
    priority: "Medium",
    type: "Full-Time",
    deadline: "2/10/2025",
    assignedTo: "Jessica Kamboj",
    year: 2024,
    performanceRating: "Good",
  },
  {
    id: "TU-2024-0003",
    company: "Amazon.in",
    position: "Data Scientist",
    location: "Bengaluru, India",
    salaryRange: "₹22,00,000 - ₹38,00,000",
    status: "Completed",
    priority: "Low",
    type: "Full-Time",
    deadline: "2/5/2025",
    assignedTo: "Khushi Chhabra",
    year: 2024,
    performanceRating: "Excellent",
  },
  {
    id: "TU-2024-0004",
    company: "Google LLC",
    position: "DevOps Engineer",
    location: "Gurugram, India",
    salaryRange: "₹23,00,000 - ₹33,00,000",
    status: "Withdrawn",
    priority: "High",
    type: "Full-Time",
    deadline: "1/30/2025",
    assignedTo: "Akshay Kumar Roy",
    year: 2024,
    performanceRating: "Good",
  },
  {
    id: "TU-2025-0005",
    company: "NVIDIA",
    position: "Full Stack Developer",
    location: "Pune, India",
    salaryRange: "₹20,00,000 - ₹30,00,000",
    status: "Pending",
    priority: "High",
    type: "Internship",
    deadline: "2/20/2025",
    assignedTo: "Aditya Sagar Singh",
    year: 2025,
    performanceRating: "Good",
  },
  {
    id: "TU-2023-0006",
    company: "Dell Technologies",
    position: "Software Engineer Intern",
    location: "Chennai, India",
    salaryRange: "₹30,000 - ₹50,000/month",
    status: "In Review",
    priority: "Medium",
    type: "Internship",
    deadline: "3/10/2025",
    assignedTo: "Jessica Kamboj",
    year: 2023,
    performanceRating: "Average",
  },
  {
    id: "TU-2023-0007",
    company: "Flipkart.in",
    position: "Marketing Specialist",
    location: "Bengaluru, India",
    salaryRange: "₹10,00,000 - ₹15,00,000",
    status: "Completed",
    priority: "Low",
    type: "Full-Time",
    deadline: "1/25/2025",
    assignedTo: "Khushi Chhabra",
    year: 2023,
    performanceRating: "Good",
  },
  {
    id: "TU-2024-0008",
    company: "AMD.Inc",
    position: "Hardware Design Engineer",
    location: "Hyderabad, India",
    salaryRange: "₹18,00,000 - ₹28,00,000",
    status: "Pending",
    priority: "High",
    type: "Full-Time",
    deadline: "3/01/2025",
    assignedTo: "Akshay Kumar Roy",
    year: 2024,
    performanceRating: "Average",
  },
]

export default function Dashboard() {
  const { user, login } = useUser()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewingTeamMember, setViewingTeamMember] = useState<string | null>(null)
  const [originalUser, setOriginalUser] = useState<any>(null)
  const [showCompaniesSection, setShowCompaniesSection] = useState(false)

  const isHRManager = user?.role === "HR Manager"
  const isAdmin = user?.role === "Admin"
  const isHOD = user?.role === "HOD"

  const [requests, setRequests] = useState(isHRManager ? hrManagerRequests : initialRequests)
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null)
  const [tempDeadline, setTempDeadline] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [performanceFilter, setPerformanceFilter] = useState<string>("all")
  const [companySearchTerm, setCompanySearchTerm] = useState("")

  const [csvExportYear, setCsvExportYear] = useState<string>("all")
  const [csvExportMonth, setCsvExportMonth] = useState<string>("all")
  const [showExportFilters, setShowExportFilters] = useState(false)

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
  ]

  const displayRequests = viewingTeamMember
    ? initialRequests.filter((req) => req.assignedTo === viewingTeamMember)
    : requests

  const filteredRequests = useMemo(() => {
    return displayRequests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
      const matchesType = typeFilter === "all" || request.type === typeFilter
      const matchesYear = yearFilter === "all" || request.year.toString() === yearFilter
      const matchesPerformance = performanceFilter === "all" || request.performanceRating === performanceFilter
      const matchesCompanySearch =
        !companySearchTerm ||
        request.company.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        request.position.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(companySearchTerm.toLowerCase())
      return (
        matchesStatus && matchesPriority && matchesType && matchesYear && matchesPerformance && matchesCompanySearch
      )
    })
  }, [displayRequests, statusFilter, priorityFilter, typeFilter, yearFilter, performanceFilter, companySearchTerm])

  const uniqueStatuses = useMemo(() => ["all", ...new Set(displayRequests.map((r) => r.status))], [displayRequests])
  const uniquePriorities = useMemo(() => ["all", ...new Set(displayRequests.map((r) => r.priority))], [displayRequests])
  const uniqueTypes = useMemo(() => ["all", ...new Set(displayRequests.map((r) => r.type))], [displayRequests])
  const uniqueYears = useMemo(
    () => [
      "all",
      ...Array.from(new Set(displayRequests.map((r) => r.year.toString())))
        .sort()
        .reverse(),
    ],
    [displayRequests],
  )
  const uniquePerformanceRatings = useMemo(
    () => ["all", ...new Set(displayRequests.map((r) => r.performanceRating))],
    [displayRequests],
  )

  const companyStats = useMemo(() => {
    const companies = [...new Set(displayRequests.map((r) => r.company))]
    const yearStats = uniqueYears.slice(1).map((year) => ({
      year,
      count: displayRequests.filter((r) => r.year.toString() === year).length,
    }))
    const performanceStats = uniquePerformanceRatings.slice(1).map((rating) => ({
      rating,
      count: displayRequests.filter((r) => r.performanceRating === rating).length,
    }))

    return {
      totalCompanies: companies.length,
      yearStats,
      performanceStats,
    }
  }, [displayRequests, uniqueYears, uniquePerformanceRatings])

  const handleRefreshData = () => {
    window.location.reload()
  }

  const handleHiringRequests = () => {
    router.push("/messages")
  }

  const handleSendUpdates = () => {
    router.push("/messages")
  }

  const handleImportData = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      console.log(
        "Files uploaded:",
        Array.from(files).map((f) => f.name),
      )
      alert(
        `Successfully uploaded ${files.length} file(s): ${Array.from(files)
          .map((f) => f.name)
          .join(", ")}`,
      )
    }
  }

  const handleViewProgress = (memberName: string) => {
    if (isAdmin) {
      setOriginalUser(user)
      const teamMember = teamMembers.find((m) => m.name === memberName)
      if (teamMember) {
        setViewingTeamMember(memberName)
        login({
          ...teamMember,
          company: "HireHub",
        })
      }
    }
  }

  const handleBackToAdmin = () => {
    if (originalUser) {
      login(originalUser)
      setViewingTeamMember(null)
      setOriginalUser(null)
    }
  }

  const handleEditDeadline = (id: string, currentDeadline: string) => {
    setEditingDeadline(id)
    setTempDeadline(currentDeadline)
  }

  const handleSaveDeadline = (id: string) => {
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, deadline: tempDeadline } : req)))
    setEditingDeadline(null)
    setTempDeadline("")
  }

  const handleCancelEdit = () => {
    setEditingDeadline(null)
    setTempDeadline("")
  }

  const handleRequestDeadlineChange = (requestId: string, currentDeadline: string) => {
    const message = `I wish to change the deadline for request ${requestId} to ${currentDeadline}. Please review and approve this change.`
    router.push(`/messages?prefill=${encodeURIComponent(message)}`)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "In Review":
        return "bg-badge-in-review text-badge-in-review-foreground"
      case "Pending":
        return "bg-badge-pending text-badge-pending-foreground"
      case "Completed":
        return "bg-badge-completed text-badge-completed-foreground"
      case "Withdrawn":
        return "bg-badge-withdrawn text-badge-withdrawn-foreground"
      default:
        return ""
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-badge-high text-badge-high-foreground"
      case "Medium":
        return "bg-badge-medium text-badge-medium-foreground"
      case "Low":
        return "bg-badge-low text-badge-low-foreground"
      default:
        return ""
    }
  }

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "Full-Time":
        return "bg-badge-full-time text-badge-full-time-foreground"
      case "Internship":
        return "bg-badge-internship text-badge-internship-foreground"
      default:
        return ""
    }
  }

  const getPerformanceBadgeClass = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Average":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const buttonClass = isHRManager
    ? "bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm cursor-pointer"
    : "bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer"

  const handleExportCSV = () => {
    let placementRecords = [
      ...initialRequests
        .filter((req) => req.status === "Completed")
        .map((req, index) => ({
          srNo: index + 1,
          companyName: req.company,
          position: req.position,
          year: req.year || 2024, // Ensure year exists
          designation: req.position,
          location: req.location,
          salaryRange: req.salaryRange,
          branch: "Computer Science Engineering",
          studentName: req.assignedTo,
          placementDate: req.deadline,
          type: req.type,
          performanceRating: req.performanceRating || "Good",
          month: req.deadline ? new Date(req.deadline).getMonth() + 1 : 1, // Ensure month exists
        })),
      {
        srNo: 9,
        companyName: "Tata Consultancy Services",
        position: "Software Engineer",
        year: 2024,
        designation: "Software Engineer",
        location: "Mumbai, India",
        salaryRange: "₹3,50,000 - ₹4,50,000",
        branch: "Information Technology",
        studentName: "Arjun Sharma",
        placementDate: "12/15/2024",
        type: "Full-Time",
        performanceRating: "Good",
        month: 12,
      },
      {
        srNo: 10,
        companyName: "Infosys Limited",
        position: "Systems Engineer",
        year: 2024,
        designation: "Systems Engineer",
        location: "Bengaluru, India",
        salaryRange: "₹3,25,000 - ₹4,00,000",
        branch: "Electronics & Communication",
        studentName: "Priya Patel",
        placementDate: "11/20/2024",
        type: "Full-Time",
        performanceRating: "Good",
        month: 11,
      },
      {
        srNo: 11,
        companyName: "Wipro Technologies",
        position: "Project Engineer",
        year: 2023,
        designation: "Project Engineer",
        location: "Hyderabad, India",
        salaryRange: "₹3,75,000 - ₹4,25,000",
        branch: "Mechanical Engineering",
        studentName: "Amit Singh",
        placementDate: "10/30/2023",
        type: "Full-Time",
        performanceRating: "Average",
        month: 10,
      },
      {
        srNo: 12,
        companyName: "HCL Technologies",
        position: "Software Developer",
        year: 2023,
        designation: "Software Developer",
        location: "Chennai, India",
        salaryRange: "₹3,00,000 - ₹3,75,000",
        branch: "Computer Science Engineering",
        studentName: "Sneha Gupta",
        placementDate: "09/15/2023",
        type: "Full-Time",
        performanceRating: "Excellent",
        month: 9,
      },
      {
        srNo: 13,
        companyName: "Tech Mahindra",
        position: "Associate Engineer",
        year: 2025,
        designation: "Associate Engineer",
        location: "Pune, India",
        salaryRange: "₹3,20,000 - ₹4,00,000",
        branch: "Information Technology",
        studentName: "Rohit Kumar",
        placementDate: "01/20/2025",
        type: "Full-Time",
        performanceRating: "Good",
        month: 1,
      },
      {
        srNo: 14,
        companyName: "Cognizant Technology Solutions",
        position: "Programmer Analyst",
        year: 2025,
        designation: "Programmer Analyst",
        location: "Kolkata, India",
        salaryRange: "₹3,40,000 - ₹4,20,000",
        branch: "Computer Science Engineering",
        studentName: "Ananya Verma",
        placementDate: "02/10/2025",
        type: "Full-Time",
        performanceRating: "Excellent",
        month: 2,
      },
    ]

    if (csvExportYear !== "all") {
      placementRecords = placementRecords.filter((record) => {
        const recordYear = record.year ? record.year.toString() : "2024"
        return recordYear === csvExportYear
      })
    }

    if (csvExportMonth !== "all") {
      const monthIndex = monthNames.indexOf(csvExportMonth) + 1
      placementRecords = placementRecords.filter((record) => {
        const recordMonth = record.month || 1
        return recordMonth === monthIndex
      })
    }

    const csvHeaders = [
      "Sr No.",
      "Company Name",
      "Student Name",
      "Position",
      "Designation",
      "Location",
      "Salary Range",
      "Branch",
      "Placement Date",
      "Year",
      "Type",
    ]

    const csvContent = [
      csvHeaders.join(","),
      ...placementRecords.map((record) =>
        [
          record.srNo,
          `"${record.companyName}"`,
          `"${record.position}"`,
          record.year,
          `"${record.designation}"`,
          `"${record.location}"`,
          `"${record.salaryRange}"`,
          `"${record.branch}"`,
          `"${record.studentName}"`,
          `"${record.placementDate}"`,
          `"${record.type}"`,
          `"${record.performanceRating}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)

    let filename = "branch-wise-placement-records"
    if (csvExportYear !== "all") filename += `-${csvExportYear}`
    if (csvExportMonth !== "all") filename += `-${csvExportMonth}`
    filename += `.csv`

    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Reset filters after export
    setShowExportFilters(false)
    setCsvExportYear("all")
    setCsvExportMonth("all")
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 ml-56">
          <header className="flex h-14 items-center gap-3 border-b bg-white px-4">
            <div className="w-full flex-1">
              {viewingTeamMember && originalUser && (
                <Button
                  onClick={handleBackToAdmin}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin View
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserProfileDropdown />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {viewingTeamMember
                  ? `${viewingTeamMember}'s Dashboard - Team Member View`
                  : isHRManager
                    ? "Welcome to Apple's hiring portal! Manage your job postings and candidates"
                    : "Welcome back! Here's what's happening with your hiring requests today"}
              </h1>
            </div>

            {!isHRManager && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-500">Total Companies</CardTitle>
                    <div className="h-3 w-3 text-gray-400">🏢</div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-xl font-bold">142</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-2 w-2 mr-1" />
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-500">Active Requests</CardTitle>
                    <div className="h-3 w-3 text-gray-400">💼</div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-xl font-bold">87</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-2 w-2 mr-1" />
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-500">Pending Review</CardTitle>
                    <Clock className="h-3 w-3 text-gray-400" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-xl font-bold">23</div>
                    <p className="text-xs text-red-600 flex items-center">
                      <ArrowDownRight className="h-2 w-2 mr-1" />
                      -5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-gray-500">Completed</CardTitle>
                    <CheckCircle className="h-3 w-3 text-gray-400" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-xl font-bold">64</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <ArrowUpRight className="h-2 w-2 mr-1" />
                      +7% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <h2 className="text-lg font-semibold text-gray-900 mt-2">Quick Actions</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Button
                className={`h-auto flex-col items-start justify-start gap-1 p-3 text-left ${buttonClass}`}
                onClick={handleHiringRequests}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {isHRManager ? "Create New Job Posting" : "Create New Request"}
                </span>
                <span className="text-xs font-normal opacity-80">
                  {isHRManager ? "Post a new job opening" : "Start a new hiring request"}
                </span>
              </Button>
              <Card
                className={`flex flex-col items-start justify-start gap-1 p-3 rounded-lg border ${isHRManager ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-green-200 bg-green-50 hover:bg-green-100"} shadow-sm cursor-pointer transition-colors`}
                onClick={handleImportData}
              >
                <Upload className={`h-4 w-4 ${isHRManager ? "text-red-500" : "text-green-600"}`} />
                <CardTitle className={`text-sm font-semibold ${isHRManager ? "text-red-800" : "text-green-900"} mt-1`}>
                  Import Data
                </CardTitle>
                <p className={`text-xs ${isHRManager ? "text-red-600" : "text-green-700"}`}>
                  {isHRManager ? "Upload candidate resumes" : "Upload hiring requests from CSV"}
                </p>
              </Card>
              <Card
                className="flex flex-col items-start justify-start gap-1 p-3 rounded-lg border border-purple-200 shadow-sm bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                onClick={() => console.log("Export Report clicked")}
              >
                <Download className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm font-semibold text-purple-900 mt-1">Export Report</CardTitle>
                <p className="text-xs text-purple-700">
                  {isHRManager ? "Download hiring analytics" : "Download current data in Excel"}
                </p>
              </Card>
              {(isAdmin || isHOD) && (
                <Card className="flex flex-col items-start justify-start gap-1 p-3 rounded-lg border border-emerald-200 shadow-sm bg-emerald-50 hover:bg-emerald-100 cursor-pointer transition-colors">
                  {!showExportFilters ? (
                    <div onClick={() => setShowExportFilters(true)} className="w-full">
                      <Download className="h-4 w-4 text-emerald-600" />
                      <CardTitle className="text-sm font-semibold text-emerald-900 mt-1">
                        Export Placement CSV
                      </CardTitle>
                      <p className="text-xs text-emerald-700">Download branch-wise placement records</p>
                    </div>
                  ) : (
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-emerald-600" />
                        <CardTitle className="text-sm font-semibold text-emerald-900">Export Filters</CardTitle>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-emerald-700 block mb-1">Year:</label>
                          <select
                            value={csvExportYear}
                            onChange={(e) => setCsvExportYear(e.target.value)}
                            className="w-full text-xs border rounded px-2 py-1 bg-white"
                          >
                            <option value="all">All Years</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-emerald-700 block mb-1">Month:</label>
                          <select
                            value={csvExportMonth}
                            onChange={(e) => setCsvExportMonth(e.target.value)}
                            className="w-full text-xs border rounded px-2 py-1 bg-white"
                          >
                            <option value="all">All Months</option>
                            {monthNames.map((month) => (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleExportCSV}
                            className="flex-1 bg-emerald-600 text-white text-xs py-1 px-2 rounded hover:bg-emerald-700"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => setShowExportFilters(false)}
                            className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
              <Card
                className="flex flex-col items-start justify-start gap-1 p-3 rounded-lg border border-teal-200 shadow-sm bg-teal-50 hover:bg-teal-100 cursor-pointer transition-colors"
                onClick={handleRefreshData}
              >
                <RefreshCw className="h-4 w-4 text-teal-600" />
                <CardTitle className="text-sm font-semibold text-teal-900 mt-1">Refresh Data</CardTitle>
                <p className="text-xs text-teal-700">
                  {isHRManager ? "Sync with job boards" : "Sync with external systems"}
                </p>
              </Card>
              {!isHRManager && (
                <>
                  <Card
                    className="flex flex-col items-start justify-start gap-1 p-3 rounded-lg border border-orange-200 shadow-sm bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
                    onClick={handleSendUpdates}
                  >
                    <Download className="h-4 w-4 text-orange-600" />
                    <CardTitle className="text-sm font-semibold text-orange-900 mt-1">Send Updates</CardTitle>
                    <p className="text-xs text-orange-700">Notify companies of status changes</p>
                  </Card>
                  <Card
                    className="flex flex-col items-start justify-start gap-1 p-3 rounded-lg border border-indigo-200 shadow-sm bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-colors"
                    onClick={() => console.log("Filter Requests clicked")}
                  >
                    <Download className="h-4 w-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold text-indigo-900 mt-1">Filter Requests</CardTitle>
                    <p className="text-xs text-indigo-700">Advanced filtering options</p>
                  </Card>
                </>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {viewingTeamMember
                  ? `${viewingTeamMember}'s Assigned Requests`
                  : isHRManager
                    ? "Your Hiring Requests"
                    : "Recent Hiring Requests"}
              </h2>
              {isAdmin && !viewingTeamMember && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search companies..."
                    className="w-64 rounded-lg bg-gray-100 pl-8 h-8 text-sm"
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 h-10">
                    <TableHead className="w-[120px] text-gray-600 font-semibold text-xs px-3">Request ID</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">
                      {isHRManager ? "Job Title" : "Company"}
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">Position</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">Location</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">Salary Range</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="flex items-center gap-1 cursor-pointer">
                            Status <ChevronDown className="h-2 w-2" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {uniqueStatuses.map((status) => (
                            <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                              {status === "all" ? "All Statuses" : status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    {!isHRManager && (
                      <TableHead className="text-gray-600 font-semibold text-xs px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <span className="flex items-center gap-1 cursor-pointer">
                              Priority <ChevronDown className="h-2 w-2" />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {uniquePriorities.map((priority) => (
                              <DropdownMenuItem key={priority} onClick={() => setPriorityFilter(priority)}>
                                {priority === "all" ? "All Priorities" : priority}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableHead>
                    )}
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="flex items-center gap-1 cursor-pointer">
                            Type <ChevronDown className="h-2 w-2" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {uniqueTypes.map((type) => (
                            <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                              {type === "all" ? "All Types" : type}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold text-xs px-3">Deadline</TableHead>
                    {isAdmin && !viewingTeamMember && (
                      <TableHead className="text-gray-600 font-semibold text-xs px-3">Assigned To</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="group h-10">
                      <TableCell className="font-medium text-xs px-3">
                        <Link
                          href={`/messages?company=${encodeURIComponent(request.company)}`}
                          className={`${isHRManager ? "text-red-500 hover:text-red-600" : "text-blue-600 hover:text-blue-800"} hover:underline`}
                        >
                          {request.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs px-3">{request.company}</TableCell>
                      <TableCell className="text-xs px-3">{request.position}</TableCell>
                      <TableCell className="text-xs px-3">{request.location}</TableCell>
                      <TableCell className="text-xs px-3">{request.salaryRange}</TableCell>
                      <TableCell className="px-3">
                        <Badge className={`${getStatusBadgeClass(request.status)} text-xs px-2 py-0.5`}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      {!isHRManager && (
                        <TableCell className="px-3">
                          <Badge className={`${getPriorityBadgeClass(request.priority)} text-xs px-2 py-0.5`}>
                            {request.priority}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="px-3">
                        <Badge className={`${getTypeBadgeClass(request.type)} text-xs px-2 py-0.5`}>
                          {request.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        {isHRManager ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{request.deadline}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRequestDeadlineChange(request.id, request.deadline)}
                                  className="text-red-700 hover:bg-red-50 hover:text-red-800"
                                >
                                  Request to edit the deadline
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : editingDeadline === request.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={tempDeadline}
                              onChange={(e) => setTempDeadline(e.target.value)}
                              className="w-16 h-6 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveDeadline(request.id)}
                              className="h-5 w-5 p-0"
                            >
                              <Save className="h-2 w-2" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-5 w-5 p-0">
                              <X className="h-2 w-2" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{request.deadline}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDeadline(request.id, request.deadline)}
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            >
                              <Edit className="h-2 w-2" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      {isAdmin && !viewingTeamMember && (
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{(request as any).assignedTo}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewProgress((request as any).assignedTo)}
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                              title="View Progress"
                            >
                              <Eye className="h-2 w-2" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
        className="hidden"
      />
    </AuthGuard>
  )
}
