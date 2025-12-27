"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Try multiple authentication endpoints
      const authEndpoints = [
        "http://localhost:5000/api/auth/login", // FormBackend (has followup users)
        "http://localhost:5001/api/auth/login", // DashboardBackend
      ]
      
      let loginSuccess = false
      let userData = null
      
      for (const endpoint of authEndpoints) {
        try {
          console.log(`🔐 Attempting login with: ${endpoint}`)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              email,
              password,
            }),
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          // Check if response is JSON
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            console.log(`❌ ${endpoint} returned non-JSON response`)
            continue // Try next endpoint
          }

          const data = await response.json()

          if (response.ok && (data.success || data.token)) {
            console.log(`✅ Login successful with: ${endpoint}`)
            loginSuccess = true
            userData = data
            break // Success, exit loop
          } else {
            console.log(`❌ ${endpoint} returned error:`, data.message)
            setError(data.message || "Invalid credentials")
            continue // Try next endpoint
          }
        } catch (endpointError) {
          console.log(`❌ ${endpoint} failed:`, endpointError)
          continue // Try next endpoint
        }
      }
      
      if (loginSuccess && userData) {
        // Store the token and user data
        localStorage.setItem("token", userData.token)
        localStorage.setItem("user", JSON.stringify(userData.user))
        
        console.log("🎉 Login successful, redirecting...")
        
        // Redirect based on user role
        switch (userData.user.role) {
          case "FOLLOW_UP_TEAM":
            router.push("/followup") // Followup team go to their dashboard
            break
          case "HOD":
            router.push("/hod") // HODs go to HOD dashboard
            break
          case "ADMIN":
            router.push("/admin") // Admins go to admin dashboard
            break
          case "HR":
            router.push("/dashboard") // HR managers go to their dashboard
            break
          case "FOLLOW_UP_TEAM":
            router.push("/followup") // Followup team go to their dashboard
            break
          default:
            router.push("/") // Default to dashboard
        }
      } else {
        setError("Login failed. Please check your credentials and try again.")
      }
      
    } catch (err: any) {
      console.error("🚨 Critical login error:", err)
      
      if (err.name === 'AbortError') {
        setError("Request timeout. Please check your connection and try again.")
      } else {
        setError("Login failed. Please try again later or contact support.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CTPC Dashboard</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 Thapar Institute of Engineering & Technology</p>
          <p>Central Training and Placement Cell</p>
        </div>
      </div>
    </div>
  )
}