"use client"

import { DropdownAppMenu } from "@/components/drop-down-menu"
import type React from "react"

import { BackButton } from "@/components/back-button"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DropdownAppMenu />
      <main className="w-full max-w-7xl mx-auto px-4 py-6 flex-1">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
