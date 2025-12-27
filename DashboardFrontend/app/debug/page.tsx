"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async () => {
    setIsLoading(true)
    try {
      // Test the debug endpoint first
      const debugResponse = await fetch("http://localhost:5001/api/hr/debug/all-submissions")
      const debugData = await debugResponse.json()
      
      console.log("Debug API Response:", debugData)
      
      // Test the actual API
      const token = localStorage.getItem("authToken")
      const userResponse = await fetch("http://localhost:5001/api/hr/submissions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      const userData = await userResponse.json()
      console.log("User API Response:", userData)
      
      setDebugInfo({
        debug: debugData,
        user: userData,
        token: token ? "Present" : "Missing",
        userData: JSON.parse(localStorage.getItem("userData") || "null")
      })
    } catch (error: any) {
      console.error("Debug error:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAPI} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </Button>
          
          {debugInfo && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}