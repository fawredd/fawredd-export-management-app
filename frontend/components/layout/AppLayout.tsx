"use client"

import { DropdownAppMenu } from "@/components/drop-down-menu"
import type React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/auth"
import { BackButton } from "@/components/navigation/BackButton"
import { Loader2 } from "lucide-react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading } = useAuth()

  // Public routes that don't need auth
  const isPublicRoute = pathname === '/login' || pathname === '/register'

  // Show loading spinner for protected routes while auth is being checked
  if (!isPublicRoute && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DropdownAppMenu />
      <main className="w-full max-w-7xl mx-auto px-4 py-6 flex-1">
        {children}
      </main>
    </div>
  )
}
