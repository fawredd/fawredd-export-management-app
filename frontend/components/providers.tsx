"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { QueryProvider } from "./providers/query-provider"
import { ThemeProvider } from "./providers/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><QueryProvider><ThemeProvider initialTheme="light">{children}</ThemeProvider></QueryProvider></AuthProvider>
}
