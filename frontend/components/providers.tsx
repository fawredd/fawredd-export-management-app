"use client"

import type React from "react"

import { AuthProvider } from "@/features/auth"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><QueryProvider><ThemeProvider initialTheme="light">{children}</ThemeProvider></QueryProvider></AuthProvider>
}
