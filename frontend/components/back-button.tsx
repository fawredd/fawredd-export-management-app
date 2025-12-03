"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
    const router = useRouter()
    const pathname = usePathname()

    // Hide back button on login and register pages
    if (pathname === '/login' || pathname === '/register') {
        return null
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 mb-4"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    )
}
