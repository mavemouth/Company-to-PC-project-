"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Building2,
  Users,
  FileText,
  MessageSquare,
  Plus,
  ChevronDown,
  Trash2,
  Copy,
  CalendarIcon,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as UICalendar } from "@/components/ui/calendar"

interface JobDescription {
  id: string
  title: string
  type: string
  internshipDuration: string
  conditions: string
  openings: string
  skills: string
  degreePreferences: string[] // Changed to array for multiple degrees
  ctc: string
  stipend: string
  allowances: string
  cutoff: string
  eligibleDepartments: string[] // Stores selected specializations
  expandedDepartments: string[] // Stores expanded main departments
  eligibleBatches: string[]
}

interface HrContact {
  id: string
  name: string
  email: string
  phone: string
}

interface CampusVisit {
  id: string
  startDate: Date | undefined
  stageName: string
}

export default function HiringForm() {
  const [hrContacts, setHrContacts] = useState<HrContact[]>([
    { id: "hr-1", name: "", email: "", phone: "" },
  ])
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([
    {
      id: "jd-1",
      title: "",
      type: "internship",
      internshipDuration: "",
      conditions: "",
      openings: "",
      skills: "",
      degreePreferences: [""], // Changed to array
      ctc: "",
      stipend: "",
      allowances: "",
      cutoff: "",
      eligibleDepartments: [],
      expandedDepartments: [],
      eligibleBatches: [],
    },
  ])
  const [hiringStages, setHiringStages] = useState<
    { stage: string; mode: string }[]
  >([
    { stage: "Online Assessment", mode: "online" },
    { stage: "", mode: "online" },
    { stage: "", mode: "online" },
    { stage: "", mode: "online" },
  ])
  const [campusVisits, setCampusVisits] = useState<CampusVisit[]>([
    { id: "visit-1", startDate: undefined, stageName: "Campus Visit Phase 1" },
  ])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [submitResponse, setSubmitResponse] = useState<{
    email: string
    password: string
  } | null>(null)

  // Company information state
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [companyLocation, setCompanyLocation] = useState("")

  // Enhanced dummy date data with more variety
  const unavailableDates = [
    new Date(2024, 11, 15), // December 15, 2024
    new Date(2024, 11, 25), // December 25, 2024 - Christmas
    new Date(2025, 0, 1), // January 1, 2025 - New Year
    new Date(2025, 0, 26), // January 26, 2025 - Republic Day
    new Date(2025, 1, 14), // February 14, 2025
    new Date(2025, 2, 8), // March 8, 2025
    new Date(2025, 2, 21), // March 21, 2025 - Holi
  ]

  const busyDates = [
    new Date(2024, 11, 20), // December 20, 2024
    new Date(2024, 11, 21), // December 21, 2024
    new Date(2024, 11, 28), // December 28, 2024
    new Date(2025, 0, 15), // January 15, 2025
    new Date(2025, 0, 16), // January 16, 2025
    new Date(2025, 0, 22), // January 22, 2025
    new Date(2025, 1, 5), // February 5, 2025
    new Date(2025, 1, 12), // February 12, 2025
    new Date(2025, 1, 19), // February 19, 2025
    new Date(2025, 2, 5), // March 5, 2025
    new Date(2025, 2, 12), // March 12, 2025
    new Date(2025, 2, 26), // March 26, 2025
  ]

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Combined departments and schools data structure with colors
  const allDepartments = [
    {
      name: "Computer Science & Engineering Department (CSED)",
      shortName: "Computer Science & Engineering Department (CSED)",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      degrees: {
        "B.Tech": [
          "Computer Science Engineering (CSE)",
          "Computer Engineering (COE)",
          "Computer Science and Business Systems (CSBS)",
          "Artificial Intelligence and Machine Learning (A.I/M.L)",
        ],
        "M.Tech": [
          "Computer Science Engineering (CSE)",
          "Artificial Intelligence",
        ],
        "Ph.D": ["Computer Science Engineering"],
      },
    },
    {
      name: "Mechanical Engineering Department (MED)",
      shortName: "Mechanical Engineering Department (MED)",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      degrees: {
        "B.Tech": [
          "Mechanical Engineering (Mech. Eng.)",
          "Mechatronics",
          "Robotics and A.I (RAI)",
        ],
        "M.Tech": [
          "Mechanical Engineering (specialization with CAD/CAM)",
          "Flexi Timings Mode",
        ],
        "Ph.D": ["Mechanical Engineering"],
      },
    },
    {
      name: "Electrical & Instrumentation Engineering Department (EIED)",
      shortName: "Electrical & Instrumentation Department (EID)",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      degrees: {
        "B.Tech": [
          "Electrical Engineering (EE)",
          "Electrical and Computer Engineering (EEC)",
          "Electronics (Instrumentation & Control) Engineering",
          "Biomedical Engineering (BME)",
        ],
        "M.Tech": ["Electric Vehicle Technology"],
        "Ph.D": ["Electrical Engineering"],
      },
    },
    {
      name: "Electronics & Communication Engineering Department (ECED)",
      shortName: "Electronics & Communication Department (ECD)",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      degrees: {
        "B.Tech": [
          "Electronics and Communication Engineering (ECE)",
          "Electronics and Computer Engineering (ENC)",
          "Electronics Engineering (VLSI Design and Technology)",
        ],
        "M.Tech": ["VLSI Design"],
        "Ph.D": ["Electronics and Communication Engineering"],
      },
    },
    {
      name: "Civil Engineering Department (CED)",
      shortName: "Civil Engineering Department (CED)",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      degrees: {
        "B.Tech": [
          "Civil Engineering (CE)",
          "Civil Engineering with Computer Applications (CCA)",
        ],
        "M.Tech": ["Structural Engineering", "Transportation Engineering"],
        "Ph.D": ["Civil Engineering"],
      },
    },
    {
      name: "Bio-Technology Department (BTD)",
      shortName: "Bio-Technology Department (BTD)",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      degrees: {
        "B.Tech": ["Biotechnology Engineering (BT)"],
        "M.Tech": ["Biotechnology"],
        "M.Sc": ["Biotechnology"],
        "Ph.D": ["Biotechnology"],
      },
    },
    {
      name: "Chemical Engineering Department (CHED)",
      shortName: "Chemical Engineering Department (CHED)",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      degrees: {
        "B.Tech": [
          "Chemical Engineering (Ch.E)",
          "Chemical Engineering- Elective Focus in Energy",
          "Chemical Engineering- Elective Focus in Materials",
          "Chemical Engineering- Elective Focus in Petroleum",
        ],
        "M.Tech": ["Chemical Engineering"],
        "Ph.D": ["Chemical Engineering"],
      },
    },
    {
      name: "Department of Chemistry & Bio-Chemistry (DCBC)",
      shortName: "Department of Chemistry & Bio-Chemistry (DCBC)",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-800",
      borderColor: "border-cyan-200",
      degrees: {
        "B.Sc": ["Chemistry", "Chemistry (Hons.)"],
        "M.Sc": ["Chemistry", "Biochemistry"],
        "Ph.D": ["Chemistry"],
      },
    },
    {
      name: "Department of Energy and Environment (DEE)",
      shortName: "Department of Energy and Environment (DEE)",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-200",
      degrees: {
        "M.Tech": ["Environmental Science and Technology"],
        "PG Programs": [
          "Energy Management and Climate Action",
          "Waste Management and Resource Recovery",
        ],
      },
    },
    {
      name: "Department of Mathematics (DOM)",
      shortName: "Department of Mathematics (DOM)",
      bgColor: "bg-violet-100",
      textColor: "text-violet-800",
      borderColor: "border-violet-200",
      degrees: {
        "M.Sc": ["Mathematics and Computing"],
        "Ph.D": ["Mathematics"],
      },
    },
    {
      name: "Department of Physics & Material Science (DPMS)",
      shortName: "Department of Physics & Material Science (DPMS)",
      bgColor: "bg-rose-100",
      textColor: "text-rose-800",
      borderColor: "border-rose-200",
      degrees: {
        "B.Sc": ["Major: Physics"],
        "M.Sc": ["Physics"],
        "Ph.D": ["Physics"],
      },
    },
    // Merged Thapar Schools
    {
      name: "L. M. Thapar School of Management (LMTSOM)",
      shortName: "L. M. Thapar School of Management (LMTSSM)",
      bgColor: "bg-slate-100",
      textColor: "text-slate-800",
      borderColor: "border-slate-200",
      degrees: {
        MBA: ["General Management", "Finance", "Marketing", "Operations"],
      },
    },
    {
      name: "School of Humanities & Social Sciences (SHSS)",
      shortName: "School of Humanities & Social Sciences (SHSS)",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
      degrees: {
        "Ph.D": ["Humanities", "Social Sciences"],
        MA: ["English", "Psychology"],
      },
    },
    {
      name: "Thapar School of Liberal Arts & Sciences (TSLAS)",
      shortName: "Thapar School of Liberal Arts & Sciences (TSLAS)",
      bgColor: "bg-pink-100",
      textColor: "text-pink-800",
      borderColor: "border-pink-200",
      degrees: {
        BA: [
          "Economics",
          "Literary and Cultural Studies",
          "Philosophy",
          "Psychology",
          "Sociology",
          "Political Science",
          "History",
        ],
        BBA: [
          "Finance",
          "HR and Organization Leadership",
          "Marketing",
          "Information System and Analytics",
          "Strategic Management and International Business",
          "Operations Management",
        ],
        "B.Sc": [
          "Computer Sciences",
          "Data Science & A.I",
          "Physics",
          "Chemistry",
          "Mathematics",
          "Astrophysics & Space Science",
          "Mathematics & Computing",
          "Environment & Sustainability",
          "Geography & Resource Management",
          "Biotechnology",
        ],
        "B.Com": [
          "Accounting and Taxation",
          "Finance",
          "Economics",
          "Organisation Behaviour and Human Resource Management",
          "Marketing",
          "Business Analytics",
          "Strategy and Entrepreneurship",
        ],
        MCA: ["Master of Computer Applications"],
      },
    },
  ]

  // Allow duplicate stages - removed filtering
  const availableStages = [
    "Online Assessment",
    "Technical Interview",
    "HR Interview",
    "Final Interview",
  ]

  // Updated degree options to match the image
  const degreeOptions = [
    { value: "btech", label: "B.E/B.Tech" },
    { value: "mtech", label: "M.E/M.Tech" },
    { value: "BSC", label: "B.Sc" },
    { value: "msc", label: "M.Sc" },
    { value: "mca", label: "MCA" },
    { value: "ba", label: "BA" },
    { value: "bba", label: "BBA" },
    { value: "bcom", label: "B.Com" },
  ]

  // Function to get filtered departments based on selected degree preferences
  const getFilteredDepartments = (degreePreferences: string[]) => {
    if (degreePreferences.length === 0) return []

    const degreeMap: { [key: string]: string[] } = {
      btech: ["B.Tech"],
      mtech: ["M.Tech"],
      bsc: ["B.Sc"],
      msc: ["M.Sc"],
      mca: ["MCA"],
      ba: ["BA"],
      bba: ["BBA"],
      bcom: ["B.Com"],
    }

    const selectedDegreeTypes: string[] = []
    degreePreferences.forEach((pref) => {
      const mappedDegrees = degreeMap[pref]
      if (mappedDegrees) {
        selectedDegreeTypes.push(...mappedDegrees)
      }
    })

    return allDepartments.filter((dept) =>
      selectedDegreeTypes.some((degreeType) =>
        Object.keys(dept.degrees).includes(degreeType)
      )
    )
  }

  const addHrContact = () => {
    setHrContacts([
      ...hrContacts,
      { id: `hr-${Date.now()}`, name: "", email: "", phone: "" },
    ])
  }

  const removeHrContact = (id: string) => {
    if (hrContacts.length > 1) {
      setHrContacts(hrContacts.filter((contact) => contact.id !== id))
    }
  }

  const updateHrContact = (
    id: string,
    field: keyof HrContact,
    value: string
  ) => {
    setHrContacts(
      hrContacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    )
  }

  const addJobDescription = (sourceJD?: JobDescription) => {
    const newJD: JobDescription = {
      id: `jd-${Date.now()}`,
      title: sourceJD ? sourceJD.title : "",
      type: sourceJD ? sourceJD.type : "internship",
      internshipDuration: sourceJD ? sourceJD.internshipDuration : "",
      conditions: sourceJD ? sourceJD.conditions : "",
      openings: sourceJD ? sourceJD.openings : "",
      skills: sourceJD ? sourceJD.skills : "",
      degreePreferences: sourceJD ? [...sourceJD.degreePreferences] : [""],
      ctc: sourceJD ? sourceJD.ctc : "",
      stipend: sourceJD ? sourceJD.stipend : "",
      allowances: sourceJD ? sourceJD.allowances : "",
      cutoff: "",
      eligibleDepartments: sourceJD ? [...sourceJD.eligibleDepartments] : [],
      expandedDepartments: sourceJD ? [...sourceJD.expandedDepartments] : [],
      eligibleBatches: sourceJD ? [...sourceJD.eligibleBatches] : [],
    }
    setJobDescriptions([...jobDescriptions, newJD])
  }

  const duplicateFirstJobDescription = () => {
    if (jobDescriptions.length > 0) {
      addJobDescription(jobDescriptions[0])
    }
  }

  const removeJobDescription = (id: string) => {
    if (jobDescriptions.length > 1) {
      setJobDescriptions(jobDescriptions.filter((jd) => jd.id !== id))
    }
  }

  const updateJobDescription = (
    id: string,
    field: keyof JobDescription,
    value: any
  ) => {
    setJobDescriptions(
      jobDescriptions.map((jd) =>
        jd.id === id ? { ...jd, [field]: value } : jd
      )
    )
  }

  const addDegreePreference = (jdId: string) => {
    setJobDescriptions(
      jobDescriptions.map((jd) =>
        jd.id === jdId
          ? { ...jd, degreePreferences: [...jd.degreePreferences, ""] }
          : jd
      )
    )
  }

  const removeDegreePreference = (jdId: string, index: number) => {
    setJobDescriptions(
      jobDescriptions.map((jd) =>
        jd.id === jdId
          ? {
              ...jd,
              degreePreferences: jd.degreePreferences.filter(
                (_, i) => i !== index
              ),
              // Clear departments when degree preferences change
              eligibleDepartments: [],
              expandedDepartments: [],
            }
          : jd
      )
    )
  }

  const updateDegreePreference = (
    jdId: string,
    index: number,
    value: string
  ) => {
    setJobDescriptions(
      jobDescriptions.map((jd) =>
        jd.id === jdId
          ? {
              ...jd,
              degreePreferences: jd.degreePreferences.map((pref, i) =>
                i === index ? value : pref
              ),
              // Clear departments when degree preferences change
              eligibleDepartments: [],
              expandedDepartments: [],
            }
          : jd
      )
    )
  }

  // This now toggles specializations
  const toggleSpecialization = useCallback(
    (jdId: string, specialization: string) => {
      setJobDescriptions((prevJDs) =>
        prevJDs.map((jd) => {
          if (jd.id === jdId) {
            const updatedSpecializations = jd.eligibleDepartments.includes(
              specialization
            )
              ? jd.eligibleDepartments.filter((s) => s !== specialization)
              : [...jd.eligibleDepartments, specialization]
            return { ...jd, eligibleDepartments: updatedSpecializations }
          }
          return jd
        })
      )
    },
    []
  )

  // This toggles the expansion of the main department
  const toggleDepartmentExpansion = useCallback(
    (jdId: string, deptName: string) => {
      setJobDescriptions((prevJDs) =>
        prevJDs.map((jd) => {
          if (jd.id === jdId) {
            const updatedExpanded = jd.expandedDepartments.includes(deptName)
              ? jd.expandedDepartments.filter((d) => d !== deptName)
              : [...jd.expandedDepartments, deptName]
            return { ...jd, expandedDepartments: updatedExpanded }
          }
          return jd
        })
      )
    },
    []
  )

  const toggleBatch = useCallback((jdId: string, batch: string) => {
    setJobDescriptions((prevJDs) =>
      prevJDs.map((jd) => {
        if (jd.id === jdId) {
          const updatedBatches = jd.eligibleBatches.includes(batch)
            ? jd.eligibleBatches.filter((b) => b !== batch)
            : [...jd.eligibleBatches, batch]
          return { ...jd, eligibleBatches: updatedBatches }
        }
        return jd
      })
    )
  }, [])

  const updateHiringStage = (
    index: number,
    field: "stage" | "mode",
    value: string
  ) => {
    const newStages = [...hiringStages]
    if (field === "stage") {
      newStages[index] = {
        ...newStages[index],
        stage: value === "none" ? "" : value,
      }
    } else {
      newStages[index] = { ...newStages[index], mode: value }
    }
    setHiringStages(newStages)
  }

  const addHiringStage = () => {
    setHiringStages((prevStages) => [
      ...prevStages,
      { stage: "", mode: "online" },
    ])
  }

  const removeHiringStage = (indexToRemove: number) => {
    setHiringStages((prevStages) =>
      prevStages.filter((_, index) => index !== indexToRemove)
    )
  }

  // Removed filtering - now allows duplicate stages
  const getAvailableStagesForIndex = (currentIndex: number) => {
    return availableStages
  }

  const addCampusVisit = () => {
    setCampusVisits([
      ...campusVisits,
      {
        id: `visit-${Date.now()}`,
        startDate: undefined,
        stageName: `Campus Visit Phase ${campusVisits.length + 1}`,
      },
    ])
  }

  const removeCampusVisit = (id: string) => {
    if (campusVisits.length > 1) {
      setCampusVisits(campusVisits.filter((visit) => visit.id !== id))
    }
  }

  const updateCampusVisit = (
    id: string,
    field: keyof CampusVisit,
    value: Date | undefined | string
  ) => {
    setCampusVisits(
      campusVisits.map((visit) =>
        visit.id === id ? { ...visit, [field]: value } : visit
      )
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      // Check file size (50MB = 50 * 1024 * 1024 bytes)
      const maxSize = 50 * 1024 * 1024
      const validFiles = fileArray.filter((file) => file.size <= maxSize)

      if (validFiles.length !== fileArray.length) {
        alert("Some files exceed the 50MB limit and were not uploaded.")
      }

      setUploadedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form data before submission
    if (!companyName.trim()) {
      alert("Please enter the company name")
      return
    }

    if (!companyWebsite.trim()) {
      alert("Please enter the company website")
      return
    }

    if (!companyLocation.trim()) {
      alert("Please enter the company location")
      return
    }

    if (hrContacts.length === 0 || !hrContacts[0].email) {
      alert("Please add at least one HR contact with email")
      return
    }

    if (jobDescriptions.length === 0) {
      alert("Please add at least one job description")
      return
    }

    try {
      const formData = new FormData()

      // Add all uploaded files
      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })

      // Prepare the form data
      const submissionData = {
        companyName,
        companyWebsite,
        companyLocation,
        hrContacts,
        jobDescriptions,
        hiringStages: hiringStages.filter((stage) => stage.stage !== ""), // Only include non-empty stages
        campusVisits: campusVisits.map((visit) => ({
          ...visit,
          // Store date in YYYY-MM-DD format to avoid timezone issues
          startDate: visit.startDate
            ? `${visit.startDate.getFullYear()}-${String(
                visit.startDate.getMonth() + 1
              ).padStart(2, "0")}-${String(visit.startDate.getDate()).padStart(
                2,
                "0"
              )}`
            : null,
        })),
      }

      // Add the JSON data
      formData.append("formData", JSON.stringify(submissionData))

      console.log("Submitting form data:", submissionData) // Log the data being sent

      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      console.log("Response status:", res.status) // Log the response status

      const data = await res.json()
      console.log("Response data:", data) // Log the response data

      if (res.ok && data.success) {
        console.log("✅ Success:", data)
        // Set the response data for display
        setSubmitResponse({
          email: data.credentials.email,
          password: data.credentials.password,
        })

        // Reset all form states
        setHrContacts([{ id: "hr-1", name: "", email: "", phone: "" }])
        setJobDescriptions([
          {
            id: "jd-1",
            title: "",
            type: "internship",
            internshipDuration: "",
            conditions: "",
            openings: "",
            skills: "",
            degreePreferences: [""],
            ctc: "",
            stipend: "",
            allowances: "",
            cutoff: "",
            eligibleDepartments: [],
            expandedDepartments: [],
            eligibleBatches: [],
          },
        ])
        setHiringStages([
          { stage: "Online Assessment", mode: "online" },
          { stage: "", mode: "online" },
          { stage: "", mode: "online" },
        ])
        setCampusVisits([
          {
            id: "visit-1",
            startDate: undefined,
            stageName: "Campus Visit Phase 1",
          },
        ])
        setUploadedFiles([])
        setIsSubmitted(true)

        // Store the dashboard URL for redirection
        if (data.credentials.dashboardUrl) {
          window.localStorage.setItem(
            "dashboardRedirectUrl",
            data.credentials.dashboardUrl
          )
        }
      } else {
        console.error("❌ Error:", data)
        alert(
          `Error submitting form: ${
            data.error || data.message || "Unknown error"
          }`
        )
      }
    } catch (err) {
      console.error("❌ Network Error:", err)
      alert(
        `Failed to submit form: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Message Overlay */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Form Successfully Submitted!
            </h2>
            <p className="text-slate-600 mb-4">
              Your hiring request has been submitted successfully. Please use
              the credentials below to access your dashboard.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">
                Your Dashboard Credentials:
              </h3>
              <p className="text-blue-700 mb-1">
                <strong>Email:</strong>{" "}
                <span id="hr-email">{submitResponse?.email}</span>
              </p>
              <p className="text-blue-700 mb-2">
                <strong>Password:</strong>{" "}
                <span id="hr-password">{submitResponse?.password}</span>
              </p>
              <p className="text-sm text-blue-600">
                Please save these credentials securely. You'll need them to
                access your dashboard.
              </p>
            </div>
            <Button
              onClick={() => {
                const dashboardUrl =
                  window.localStorage.getItem("dashboardRedirectUrl") ||
                  "http://localhost:3002/login"
                window.localStorage.removeItem("dashboardRedirectUrl") // Clean up
                window.location.href = dashboardUrl
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Dashboard Login
            </Button>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        {/* Logo and Hiring Request title */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="bg-red-600 text-white font-bold text-2xl w-12 h-12 flex items-center justify-center rounded">
                TI
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-gray-800">
                  THAPAR INSTITUTE
                </div>
                <div className="text-sm text-gray-600">
                  OF ENGINEERING & TECHNOLOGY
                </div>
                <div className="text-xs text-gray-500">
                  (Deemed to be University)
                </div>
              </div>
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
            Hiring Request
          </h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Company Information */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-5 w-5" />
                Company Information *
              </CardTitle>
              <CardDescription className="text-blue-100">
                Tell us about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="company-name"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Company Name *
                  </Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Company Website *
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>
                {/* New Location Row */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Company Location *
                  </Label>
                  <Input
                    id="location"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="e.g., Patiala, Punjab"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>

                {hrContacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="grid gap-6 md:col-span-2 md:grid-cols-3"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor={`hr-name-${contact.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        HR Contact Name {index === 0 ? "*" : ""}
                      </Label>
                      <Input
                        id={`hr-name-${contact.id}`}
                        placeholder="Enter HR name"
                        value={contact.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateHrContact(
                            contact.id,
                            "name",
                            e.target.value.replace(/[^a-zA-Z\s]/g, "")
                          )
                        }
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`hr-email-${contact.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        HR Email {index === 0 ? "*" : ""}
                      </Label>
                      <Input
                        id={`hr-email-${contact.id}`}
                        type="email"
                        placeholder="hr@company.com"
                        value={contact.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateHrContact(contact.id, "email", e.target.value)
                        }
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={`hr-phone-${contact.id}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          HR Phone Number
                        </Label>
                        <Input
                          id={`hr-phone-${contact.id}`}
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={contact.phone}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            // Only allow digits and limit to 10 characters
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10)
                            updateHrContact(contact.id, "phone", value)
                          }}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                            }
                          }}
                        />
                        {contact.phone && contact.phone.length < 10 && (
                          <p className="text-xs text-red-600">
                            Phone number must be exactly 10 digits
                          </p>
                        )}
                      </div>
                      {hrContacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHrContact(contact.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={addHrContact}
                    variant="outline"
                    className="border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another HR Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Descriptions */}
          <div className="space-y-4">
            {jobDescriptions.map((jd, index) => (
              <Card
                key={jd.id}
                className="border-0 shadow-lg shadow-slate-200/50 rounded-xl"
              >
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-xl">
                        Job Description {index + 1} *
                      </CardTitle>
                    </div>
                    {jobDescriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJobDescription(jd.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription className="text-emerald-100">
                    Specify the role and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Job Title and Job Type on same row (swapped positions) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`job-title-${jd.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        Job Title *
                      </Label>
                      <Input
                        id={`job-title-${jd.id}`}
                        placeholder="e.g., Software Engineer"
                        value={jd.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateJobDescription(jd.id, "title", e.target.value)
                        }
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Job Type *
                      </Label>
                      <Select
                        value={jd.type}
                        onValueChange={(value: string) =>
                          updateJobDescription(jd.id, "type", value)
                        }
                      >
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="internship-fulltime">
                            Internship + Full Time
                          </SelectItem>
                          <SelectItem value="internship-ppo">
                            Internship + Pre-Placement Offer (PPO)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`openings-${jd.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        Number of Openings
                      </Label>
                      <Input
                        id={`openings-${jd.id}`}
                        type="number"
                        placeholder="e.g., 5"
                        value={jd.openings}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateJobDescription(
                            jd.id,
                            "openings",
                            e.target.value
                          )
                        }
                        onKeyPress={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault()
                          }
                        }}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                          }
                        }}
                      />
                    </div>

                    {/* Internship Duration - Only show for "internship" and "internship-ppo" */}
                    {(jd.type === "internship" ||
                      jd.type === "internship-ppo") && (
                      <div className="space-y-2">
                        <Label
                          htmlFor={`internship-duration-${jd.id}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          Internship Duration *
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`internship-duration-${jd.id}`}
                            type="number"
                            min="1"
                            max="12"
                            placeholder="6"
                            value={jd.internshipDuration}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const val = Number.parseInt(e.target.value)
                              if (!isNaN(val) && val >= 1 && val <= 12) {
                                updateJobDescription(
                                  jd.id,
                                  "internshipDuration",
                                  e.target.value
                                )
                              } else if (e.target.value === "") {
                                updateJobDescription(
                                  jd.id,
                                  "internshipDuration",
                                  ""
                                )
                              }
                            }}
                            className="w-20 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                              }
                            }}
                          />
                          <span className="text-sm text-slate-600">
                            month(s)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor={`cutoff-${jd.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        Cut-off Preference (CGPA) *
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`cutoff-${jd.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="7.5"
                          value={jd.cutoff}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const val = Number.parseFloat(e.target.value)
                            if (!isNaN(val) && val >= 0 && val <= 10) {
                              updateJobDescription(
                                jd.id,
                                "cutoff",
                                e.target.value
                              )
                            } else if (e.target.value === "") {
                              updateJobDescription(jd.id, "cutoff", "")
                            }
                          }}
                          className="w-20 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                            }
                          }}
                        />
                        <span className="text-sm text-slate-600">
                          and above
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`job-conditions-${jd.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        Job Conditions & Requirements *
                      </Label>
                      <Textarea
                        id={`job-conditions-${jd.id}`}
                        placeholder="e.g., Work from office, 6 months internship with possibility of full-time conversion, flexible working hours, travel requirements, etc."
                        value={jd.conditions}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          updateJobDescription(
                            jd.id,
                            "conditions",
                            e.target.value
                          )
                        }
                        className="min-h-[60px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Multi-Eligibility Batch Student Criteria */}
                    <div className="md:col-span-2">
                      <Separator className="my-4" />
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">
                        Eligible Student Batches *
                      </h4>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {["2024", "2025", "2026", "2027"].map((batch) => (
                          <div
                            key={batch}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`batch-${jd.id}-${batch}`}
                              checked={jd.eligibleBatches.includes(batch)}
                              onCheckedChange={() => toggleBatch(jd.id, batch)}
                              className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Label
                              htmlFor={`batch-${jd.id}-${batch}`}
                              className="text-sm text-slate-700 cursor-pointer"
                            >
                              {batch}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label
                        htmlFor={`skills-${jd.id}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        Required Skills *
                      </Label>
                      <Textarea
                        id={`skills-${jd.id}`}
                        placeholder="e.g., JavaScript, React, Node.js, Python, Machine Learning..."
                        value={jd.skills}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          updateJobDescription(jd.id, "skills", e.target.value)
                        }
                        className="min-h-[80px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Degree Preference Section - Moved below skills */}
                    <div className="md:col-span-2">
                      <Separator className="my-4" />
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">
                        Degree Preference(s) *
                      </h4>
                      <div className="space-y-4">
                        {jd.degreePreferences.map((preference, prefIndex) => (
                          <div
                            key={prefIndex}
                            className="flex items-center gap-2"
                          >
                            <Select
                              value={preference}
                              onValueChange={(value: string) =>
                                updateDegreePreference(jd.id, prefIndex, value)
                              }
                            >
                              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select preferred degree" />
                              </SelectTrigger>
                              <SelectContent>
                                {degreeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {jd.degreePreferences.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDegreePreference(jd.id, prefIndex)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}

                        {/* Add Another Degree Preference Button */}
                        <Button
                          type="button"
                          onClick={() => addDegreePreference(jd.id)}
                          variant="outline"
                          className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 bg-transparent"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Degree Preference
                        </Button>

                        {/* Selected Degree Preferences Display */}
                        {jd.degreePreferences.filter((pref) => pref !== "")
                          .length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {jd.degreePreferences
                              .filter((pref) => pref !== "")
                              .map((pref, index) => {
                                const degreeOption = degreeOptions.find(
                                  (opt) => opt.value === pref
                                )
                                return (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800"
                                  >
                                    {degreeOption?.label || pref}
                                  </Badge>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Eligible Departments - Now filtered based on degree preferences */}
                    <div className="md:col-span-2">
                      <Separator className="my-4" />
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">
                        Eligible Departments & Schools *
                      </h4>

                      {jd.degreePreferences.filter((pref) => pref !== "")
                        .length === 0 ? (
                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                          <div className="text-center">
                            <h5 className="text-lg font-semibold text-amber-800 mb-2">
                              Please select a degree preference first
                            </h5>
                            <p className="text-amber-700">
                              Choose your preferred degree type above to see
                              eligible departments and schools
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Department List - 3 per row with colored boxes */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getFilteredDepartments(jd.degreePreferences).map(
                              (dept) => (
                                <div key={dept.name} className="space-y-2">
                                  {/* Department Box - Colored like the image */}
                                  <div
                                    className={`${dept.bgColor} ${dept.borderColor} ${dept.textColor} border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}
                                    onClick={() =>
                                      toggleDepartmentExpansion(
                                        jd.id,
                                        dept.name
                                      )
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="min-w-0 flex-1">
                                          <h5 className="font-semibold text-sm leading-tight">
                                            {dept.shortName}
                                          </h5>
                                        </div>
                                      </div>
                                      <ChevronDown
                                        className={`h-5 w-5 transition-transform duration-300 ease-in-out flex-shrink-0 ${
                                          jd.expandedDepartments.includes(
                                            dept.name
                                          )
                                            ? "rotate-180"
                                            : "rotate-0"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Specializations Dropdown - Smooth animation */}
                                  <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                      jd.expandedDepartments.includes(dept.name)
                                        ? "max-h-[500px] opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                                  >
                                    <div className="bg-white rounded-lg border border-slate-200 p-4 mt-2 shadow-sm max-h-80 overflow-y-auto">
                                      <div className="space-y-4">
                                        {/* Show all programs directly without degree type boxes */}
                                        {Object.entries(dept.degrees)
                                          .filter(([degreeType]) => {
                                            const degreeMap: {
                                              [key: string]: string[]
                                            } = {
                                              btech: ["B.Tech"],
                                              mtech: ["M.Tech"],
                                              bsc: ["B.Sc"],
                                              msc: ["M.Sc"],
                                              mca: ["MCA"],
                                              ba: ["BA"],
                                              bba: ["BBA"],
                                              bcom: ["B.Com"],
                                            }
                                            const selectedDegreeTypes: string[] =
                                              []
                                            jd.degreePreferences.forEach(
                                              (pref) => {
                                                const mappedDegrees =
                                                  degreeMap[pref]
                                                if (mappedDegrees) {
                                                  selectedDegreeTypes.push(
                                                    ...mappedDegrees
                                                  )
                                                }
                                              }
                                            )
                                            return selectedDegreeTypes.includes(
                                              degreeType
                                            )
                                          })
                                          .map(
                                            ([degreeType, specializations]) => (
                                              <div key={degreeType}>
                                                {specializations.length > 0 && (
                                                  <div className="space-y-3">
                                                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                      {degreeType} Programs:
                                                    </div>
                                                    <div className="grid gap-2">
                                                      {specializations.map(
                                                        (
                                                          spec: string,
                                                          index: string
                                                        ) => (
                                                          <div
                                                            key={spec}
                                                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 transition-all duration-200 group"
                                                          >
                                                            <span className="text-xs font-medium text-slate-500 w-6 text-center bg-slate-200 rounded-full h-5 flex items-center justify-center group-hover:bg-slate-300 transition-colors duration-200 flex-shrink-0">
                                                              {index + 1}
                                                            </span>
                                                            <Checkbox
                                                              id={`${jd.id}-${spec}`}
                                                              checked={jd.eligibleDepartments.includes(
                                                                spec
                                                              )}
                                                              onCheckedChange={() =>
                                                                toggleSpecialization(
                                                                  jd.id,
                                                                  spec
                                                                )
                                                              }
                                                              className="border-slate-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-4 w-4 flex-shrink-0"
                                                            />
                                                            <Label
                                                              htmlFor={`${jd.id}-${spec}`}
                                                              className="text-sm text-slate-700 cursor-pointer flex-1 group-hover:text-slate-900 transition-colors duration-200 leading-tight"
                                                            >
                                                              {spec}
                                                            </Label>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                                {specializations.length ===
                                                  0 && (
                                                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <div className="text-xs text-slate-500 italic flex items-center gap-2">
                                                      <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                                      No programs available for{" "}
                                                      {degreeType}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Selected Specializations Summary */}
                          {jd.eligibleDepartments.length > 0 && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                Selected Programs (
                                {jd.eligibleDepartments.length}):
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {jd.eligibleDepartments.map((spec) => (
                                  <Badge
                                    key={spec}
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 px-3 py-1"
                                  >
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Compensation Section - Conditional based on job type */}
                    <div className="md:col-span-2">
                      <Separator className="my-4" />
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">
                        Compensation Details *
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Show CTC for full-time, internship-fulltime, and internship-ppo */}
                        {(jd.type === "full-time" ||
                          jd.type === "internship-fulltime" ||
                          jd.type === "internship-ppo") && (
                          <div className="space-y-2">
                            <Label
                              htmlFor={`ctc-${jd.id}`}
                              className="text-sm font-semibold text-slate-700"
                            >
                              CTC (Cost to Company) *
                            </Label>
                            <div className="flex gap-2">
                              <Select>
                                <SelectTrigger className="w-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inr">INR</SelectItem>
                                  <SelectItem value="usd">USD</SelectItem>
                                  <SelectItem value="eur">EUR</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="e.g., 12,00,000 per annum"
                                value={jd.ctc}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateJobDescription(
                                    jd.id,
                                    "ctc",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLInputElement>
                                ) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Show Stipend for internship, internship-fulltime, and internship-ppo */}
                        {(jd.type === "internship" ||
                          jd.type === "internship-fulltime" ||
                          jd.type === "internship-ppo") && (
                          <div className="space-y-2">
                            <Label
                              htmlFor={`stipend-${jd.id}`}
                              className="text-sm font-semibold text-slate-700"
                            >
                              Stipend (For Internships) *
                            </Label>
                            <div className="flex gap-2">
                              <Select>
                                <SelectTrigger className="w-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inr">INR</SelectItem>
                                  <SelectItem value="usd">USD</SelectItem>
                                  <SelectItem value="eur">EUR</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="e.g., 25,000 per month"
                                value={jd.stipend}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateJobDescription(
                                    jd.id,
                                    "stipend",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLInputElement>
                                ) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                          <Label
                            htmlFor={`allowances-${jd.id}`}
                            className="text-sm font-semibold text-slate-700"
                          >
                            Additional Allowances
                          </Label>
                          <Input
                            id={`allowances-${jd.id}`}
                            placeholder="e.g., Travel allowance, Food allowance, Accommodation, etc."
                            value={jd.allowances}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              updateJobDescription(
                                jd.id,
                                "allowances",
                                e.target.value
                              )
                            }
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Job Description Button & Duplicate JD Button */}
          <div className="flex justify-center gap-4">
            <Button
              type="button"
              onClick={duplicateFirstJobDescription}
              variant="outline"
              className="border-2 border-dashed border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate First JD
            </Button>

            <Button
              type="button"
              onClick={() => addJobDescription()}
              variant="outline"
              className="border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Job Description
            </Button>
          </div>

          {/* Hiring Stages - NEW TOP-LEVEL SECTION */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Hiring Stages *
              </CardTitle>
              <CardDescription className="text-purple-100">
                Define your hiring process stages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {hiringStages.map((stageItem, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase tracking-wide">
                          Stage {index + 1}
                        </Label>
                        <Select
                          value={stageItem.stage}
                          onValueChange={(value: string) =>
                            updateHiringStage(index, "stage", value)
                          }
                        >
                          <SelectTrigger className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {getAvailableStagesForIndex(index).map(
                              (availableStage) => (
                                <SelectItem
                                  key={availableStage}
                                  value={availableStage}
                                >
                                  {availableStage}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase tracking-wide">
                          Mode of Conduct
                        </Label>
                        <Select
                          value={stageItem.mode}
                          onValueChange={(value: string) =>
                            updateHiringStage(index, "mode", value)
                          }
                        >
                          <SelectTrigger className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {hiringStages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHiringStage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={addHiringStage}
                  variant="outline"
                  className="border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Stage
                </Button>
              </div>
              {hiringStages.some((stageItem) => stageItem.stage !== "") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {hiringStages
                    .filter((stageItem) => stageItem.stage !== "")
                    .map((stageItem, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-800"
                      >
                        {stageItem.stage} ({stageItem.mode})
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline - Campus Visit with Enhanced Calendar */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5" />
                Campus Visit Timeline *
              </CardTitle>
              <CardDescription className="text-orange-100">
                Select your preferred campus visit dates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Campus Visit Dates with Enhanced Calendar Widget */}
              <div className="space-y-6">
                {campusVisits.map((visit, index) => (
                  <div
                    key={visit.id}
                    className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Input
                          value={visit.stageName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateCampusVisit(
                              visit.id,
                              "stageName",
                              e.target.value
                            )
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                            }
                          }}
                          className="text-lg font-semibold text-slate-800 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter stage name"
                        />
                        {index === 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                      {campusVisits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCampusVisit(visit.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Start Date {index === 0 ? "*" : ""}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={formatDate(visit.startDate)}
                            readOnly
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                              }
                            }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-slate-300 hover:bg-slate-50 bg-transparent"
                                type="button"
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <UICalendar
                                mode="single"
                                selected={visit.startDate}
                                onSelect={(date: Date | undefined) =>
                                  updateCampusVisit(visit.id, "startDate", date)
                                }
                                initialFocus
                                disabled={(date: Date) =>
                                  date < new Date("1900-01-01")
                                }
                                showOutsideDays={false}
                                modifiers={{
                                  unavailable: unavailableDates,
                                  busy: busyDates,
                                }}
                                modifiersStyles={{
                                  unavailable: {
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    fontWeight: "bold",
                                    borderRadius: "6px",
                                  },
                                  busy: {
                                    backgroundColor: "#ca8a04",
                                    color: "white",
                                    fontWeight: "bold",
                                    borderRadius: "6px",
                                  },
                                }}
                                className="[&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:bg-green-100 [&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:text-green-800 [&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:font-medium [&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:border [&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:border-green-300 [&_.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):not(.rdp-day_selected)]:rounded-md"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {visit.startDate && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm font-semibold text-blue-800 mb-1">
                          Selected Dates:
                        </div>
                        <div className="text-sm text-blue-700">
                          {visit.startDate &&
                            `Start: ${formatDate(visit.startDate)}`}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={addCampusVisit}
                  variant="outline"
                  className="border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Campus Visit Phase
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5" />
                Additional Information
              </CardTitle>
              <CardDescription className="text-teal-100">
                Upload job description
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="job-brochure"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Job Brochure/Description *
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="job-brochure"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-slate-500" />
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, Images, Text files
                        </p>
                      </div>
                    </label>
                    <input
                      id="job-brochure"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Uploaded Files:
                      </Label>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {file.name}
                                </p>
                                <p className="text-xs text-green-600 font-semibold">
                                  ✓ Uploaded
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Submit Hiring Request
            </Button>
          </div>

          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img
                  src="/images/tiet-logo-small.svg"
                  alt="TIET Logo"
                  className="h-10 w-10"
                />
                <h3 className="text-lg font-semibold text-slate-800">
                  Thapar Institute of Engineering & Technology
                </h3>
              </div>
              <p className="text-sm text-slate-600 mb-1">
                (Deemed to be University)
              </p>
              <p className="text-sm text-slate-600">
                P.O. Box 32, Bhadson Road, Patiala - 147004, Punjab, India
              </p>
              <p className="text-sm text-slate-600">
                Phone: +91-175-2393021 | Email: placement@thapar.edu
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
