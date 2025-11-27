"use client"

import { DropdownAppMenu } from "@/components/drop-down-menu"
import type React from "react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen bg-background">
        <DropdownAppMenu />
        <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
      </div>
  )
}
