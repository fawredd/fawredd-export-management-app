"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"


import { queryClient } from "@/lib/query-client"
import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Users, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()


  // Auth check handled by middleware


  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(),
  }, queryClient)

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiClient.getClients(),
  })

  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.getBudgets(),
  })

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(),
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

  const usersData = [
    { id: "T5YMLP5M", username: "@katwa0", email: "juliano@yahoo.ca" },
    { id: "TV9O6DTI", username: "@beryl45", email: "kspiteri@live.com" },
    { id: "QZXXJHT5", username: "@belindaa", email: "wkrebs@verizon.net" },
    { id: "DB3RDP2F", username: "@cynthia", email: "csilvers@verizon.net" },
    { id: "IT5H5I2R", username: "@iulie_mutie", email: "raines@optonline.net" },
  ]

  const userColumns = [
    { header: "UserID", accessor: "id" as const },
    { header: "Username", accessor: "username" as const },
    { header: "Email-ID", accessor: "email" as const },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50">
            <Users className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

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
