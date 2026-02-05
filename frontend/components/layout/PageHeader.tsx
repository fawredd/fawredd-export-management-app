"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}