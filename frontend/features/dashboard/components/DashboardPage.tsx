"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { StatCard } from "./StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.get('/api/products').then(res => res.data),
  })

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiClient.get('/api/clients').then(res => res.data),
  })

  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.get('/api/budgets').then(res => res.data),
  })

  const canViewUsers = user?.role === "ADMIN" || user?.role === "MANUFACTURER" || user?.role === "TRADER"

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get('/api/users').then(res => res.data),
    enabled: canViewUsers,
  })

  const totalUsers = users?.length || 0
  const activeUsers = users?.length || 0 // Assuming all are active for now
  const totalProducts = products?.length || 0
  const lowStockProducts = products?.filter((p: any) => (p.stock || 0) < 10).length || 0 // Assuming stock field exists or default to 0

  // Calculate revenue from APPROVED or INVOICED budgets
  const totalRevenue = budgets
    ?.filter((b: any) => b.status === 'APPROVED' || b.status === 'INVOICED')
    .reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0) || 0

  const currentMonth = new Date().getMonth()
  const currentMonthRevenue = budgets
    ?.filter((b: any) => {
      const budgetDate = new Date(b.createdAt)
      return (b.status === 'APPROVED' || b.status === 'INVOICED') && budgetDate.getMonth() === currentMonth
    })
    .reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0) || 0

  return (
    <>
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`Active Users : ${activeUsers}`}
            trend={{ value: "+25", isPositive: true }}
          />
          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle={`Low stocks : ${lowStockProducts}`}
            trend={{ value: "-25", isPositive: false }}
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString('en-US')}`}
            subtitle={`Current Month : $${currentMonthRevenue.toLocaleString('en-US')}`}
          />
        </div>

        {/* Budget Status Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Budget Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'INVOICED'].map((status) => {
                  const count = budgets?.filter((b: any) => b.status === status).length || 0
                  const total = budgets?.length || 1 // Avoid division by zero
                  const percentage = Math.round((count / total) * 100)

                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{status.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{count} budgets</p>
                      </div>
                      <div className="font-bold">{percentage}%</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
