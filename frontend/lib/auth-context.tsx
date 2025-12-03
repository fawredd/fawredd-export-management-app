"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "./api-client"
import { User } from "@/shared/types"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by calling the API
    // The browser will automatically send the httpOnly cookie if it exists
    const checkAuth = async () => {
      try {
        const userData = await apiClient.getCurrentUser()
        setUser(userData)
      } catch (error) {
        // Not logged in or token expired
        console.error("Auth check failed:", error)
        setUser(null)
        // Force redirect if not on login page
        if (window.location.pathname !== '/login') {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password })
    const { user: userData } = response
    // Token is set in httpOnly cookie by backend
    setUser(userData)
    router.push("/")
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Backend clears the httpOnly cookie
      setUser(null)
      router.push("/login")
      router.refresh()
    }
  }

  return <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
