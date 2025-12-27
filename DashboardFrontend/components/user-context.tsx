"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";

export interface User {
  name: string;
  email: string;
  role: "ADMIN" | "HOD" | "FOLLOW_UP_TEAM" | "HR";
  company?: string;
  department?: string;
  initials?: string;
  phone?: string;
}

interface UserContextType {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  switchToTeamMember: (memberName: string) => void;
  returnToAdmin: () => void;
  originalAdminUser: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  name: "CTPC Admin",
  email: "admin.ctpc@thapar.edu",
  role: "ADMIN",
  initials: "A",
};

const hodUsers: { [key: string]: User } = {
  "CSED HOD": {
    name: "CSED HOD",
    email: "hod.csed@thapar.edu",
    role: "HOD",
    department: "Computer Science & Engineering Department (CSED)",
    initials: "H",
  },
  "MED HOD": {
    name: "MED HOD",
    email: "hod.med@thapar.edu",
    role: "HOD",
    department: "Mechanical Engineering Department (MED)",
    initials: "H",
  },
};

const followUpTeamMembers: { [key: string]: User } = {
  "Follow-up Team Member 1": {
    name: "Follow-up Team Member 1",
    email: "followup1@thapar.edu",
    role: "FOLLOW_UP_TEAM",
    initials: "F",
  },
  "Follow-up Team Member 2": {
    name: "Follow-up Team Member 2",
    email: "followup2@thapar.edu",
    role: "FOLLOW_UP_TEAM",
    initials: "F",
  },
  "Follow-up Team Member 3": {
    name: "Follow-up Team Member 3",
    email: "followup3@thapar.edu",
    role: "FOLLOW_UP_TEAM",
    initials: "F",
  },
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem("hirehub-authenticated");
    const savedUser = localStorage.getItem("hirehub-user");
    const savedOriginalAdmin = localStorage.getItem("hirehub-original-admin");

    if (authStatus === "true" && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        if (savedOriginalAdmin) {
          const parsedOriginalAdmin = JSON.parse(savedOriginalAdmin);
          setOriginalAdminUser(parsedOriginalAdmin);
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("hirehub-user");
        localStorage.removeItem("hirehub-authenticated");
        localStorage.removeItem("hirehub-original-admin");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("hirehub-user", JSON.stringify(userData));
    localStorage.setItem("hirehub-authenticated", "true");
  };

  const { clearToken } = useAuth();

  const logout = () => {
    setUser(defaultUser);
    setIsAuthenticated(false);
    clearToken();
    localStorage.removeItem("hirehub-user");
    localStorage.removeItem("hirehub-authenticated");
    localStorage.removeItem("hirehub-original-admin");
    setOriginalAdminUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("hirehub-user", JSON.stringify(updatedUser));
  };

  const switchToTeamMember = (memberName: string) => {
    if (user.role === "ADMIN" && followUpTeamMembers[memberName]) {
      // Store original admin user
      setOriginalAdminUser(user);
      localStorage.setItem("hirehub-original-admin", JSON.stringify(user));

      // Switch to team member
      const teamMember = followUpTeamMembers[memberName];
      setUser(teamMember);
      localStorage.setItem("hirehub-user", JSON.stringify(teamMember));
    }
  };

  const returnToAdmin = () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      localStorage.setItem("hirehub-user", JSON.stringify(originalAdminUser));
      localStorage.removeItem("hirehub-original-admin");
      setOriginalAdminUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        switchToTeamMember,
        returnToAdmin,
        originalAdminUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export { followUpTeamMembers, hodUsers };
