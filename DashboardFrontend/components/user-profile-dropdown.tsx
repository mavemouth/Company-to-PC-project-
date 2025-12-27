"use client"
import { ChevronDown, User, Settings, LogOut, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, followUpTeamMembers } from "@/components/user-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function UserProfileDropdown() {
  const { user, logout, switchToTeamMember, returnToAdmin, originalAdminUser } = useUser()
  const router = useRouter()
  const isHR = user?.role === "HR"
  const isHOD = user?.role === "HOD"
  const isAdmin = user?.role === "ADMIN"
  const isFollowUpTeam = user?.role === "FOLLOW_UP_TEAM"
  const isImpersonating = originalAdminUser !== null
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const handleTeamMemberSelect = (memberName: string) => {
    switchToTeamMember(memberName)
    setShowTeamMemberDialog(false)
  }

  const handleReturnToAdmin = () => {
    returnToAdmin()
  }

  const getAvatarClass = () => {
    if (isHR) return "bg-red-100 text-red-600"
    if (isHOD) return "bg-green-100 text-green-700"
    if (isFollowUpTeam) return "bg-purple-100 text-purple-700"
    return "bg-blue-100 text-blue-700"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
            <AvatarFallback className={`text-xs ${getAvatarClass()}`}>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
          {isImpersonating && <span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">Viewing</span>}
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
            <AvatarFallback className={`text-xs ${getAvatarClass()}`}>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
            {isImpersonating && <p className="text-xs text-orange-600">Viewing as {user.role}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />

        {isImpersonating && (
          <>
            <DropdownMenuItem onClick={handleReturnToAdmin}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {isAdmin && !isImpersonating && (
          <>
            <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                  <Users className="mr-2 h-4 w-4" />
                  View Team Member
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Team Member</DialogTitle>
                  <DialogDescription>Choose a team member to view their progress and dashboard.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  {Object.entries(followUpTeamMembers).map(([name, member]) => (
                    <Button
                      key={name}
                      variant="outline"
                      className="justify-start h-auto p-3 bg-transparent"
                      onClick={() => handleTeamMemberSelect(name)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {member.initials || member.name?.charAt(0) || 'F'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
