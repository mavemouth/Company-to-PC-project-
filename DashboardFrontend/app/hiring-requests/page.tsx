"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useUser } from "@/components/user-context"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Calendar, 
  Trash2,
  Building,
  MapPin,
  Users,
  DollarSign,
  Briefcase
} from "lucide-react"

interface HiringRequest {
  _id: string
  companyName: string
  hrContacts: Array<{
    name: string
    email: string
    phone: string
  }>
  jobDescriptions: Array<{
    title: string
    type: string
    openings: string
    ctc: string
    stipend: string
    skills: string
    eligibleDepartments: string[]
  }>
  campusVisits: Array<{
    startDate: string
    location: string
  }>
  createdAt: string
  status?: string
}

export default function HiringRequestsPage() {
  const { user } = useUser()
  const [requests, setRequests] = useState<HiringRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchHiringRequests()
  }, [])

  const fetchHiringRequests = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("http://localhost:5001/api/hr/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.submissions || [])
      } else {
        console.error("Failed to fetch hiring requests")
      }
    } catch (error) {
      console.error("Error fetching hiring requests:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration since no data is showing
  const mockRequests: HiringRequest[] = [
    {
      _id: "1",
      companyName: "Tech Solutions Inc.",
      hrContacts: [
        {
          name: "John Doe",
          email: "john@techsolutions.com",
          phone: "+91-98765-43210"
        }
      ],
      jobDescriptions: [
        {
          title: "Software Engineer",
          type: "Full-time",
          openings: "5",
          ctc: "12",
          stipend: "",
          skills: "React, Node.js, MongoDB",
          eligibleDepartments: ["CSE", "IT"]
        }
      ],
      campusVisits: [
        {
          startDate: "2025-10-15",
          location: "Bangalore"
        }
      ],
      createdAt: "2025-10-04",
      status: "approved"
    }
  ]

  const displayRequests = requests.length > 0 ? requests : mockRequests

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hiring Requests</h1>
            <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0] || 'diya'}! Manage your hiring requests.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - exactly as in your mockup */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hiring Requests</h1>
          <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0] || 'diya'}! Manage your hiring requests.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Search and Filters - exactly as in your mockup */}
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

      {/* Hiring Requests Cards - exactly as in your mockup */}
      <div className="space-y-4">
        {displayRequests.map((request) => (
          <Card key={request._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.companyName}</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Approved
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Job Details */}
                    <div>
                      {request.jobDescriptions?.map((job, index) => (
                        <div key={index} className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.type || "Full-time"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{job.openings || "5"} openings</span>
                            </div>
                            {request.campusVisits[0]?.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{request.campusVisits[0].location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Package: {job.ctc || "12"} LPA</span>
                            </div>
                            
                            {/* Tech Tags */}
                            <div className="flex flex-wrap gap-1">
                              {job.skills?.split(",").slice(0, 3).map((tech, techIndex) => (
                                <Badge key={techIndex} variant="secondary" className="text-xs">
                                  {tech.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* HR Contact */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">HR Contact</h4>
                      {request.hrContacts?.[0] && (
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{request.hrContacts[0].name}</div>
                          <div>{request.hrContacts[0].email}</div>
                          <div>{request.hrContacts[0].phone}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-6">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
