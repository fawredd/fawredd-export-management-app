"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, FileText, Building2, TrendingUp, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(),
  })

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(),
  })

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiClient.getClients(),
  })

  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.getBudgets(),
  })

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: () => apiClient.getProviders(),
  })

  // Calculate statistics
  const totalUsers = users?.length || 0
  const adminUsers = users?.filter((u: any) => u.role === "ADMIN").length || 0
  const manufacturerUsers = users?.filter((u: any) => u.role === "MANUFACTURER").length || 0
  const traderUsers = users?.filter((u: any) => u.role === "TRADER").length || 0

  const totalProducts = products?.length || 0
  const totalClients = clients?.length || 0
  const totalProviders = providers?.length || 0
  const totalBudgets = budgets?.length || 0

  const pendingBudgets = budgets?.filter((b: any) => b.status === "PENDING").length || 0
  const approvedBudgets = budgets?.filter((b: any) => b.status === "APPROVED").length || 0

  const totalRevenue = budgets
    ?.filter((b: any) => b.status === "APPROVED" || b.status === "INVOICED")
    .reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0) || 0

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      subtitle: `${adminUsers} Admins, ${manufacturerUsers} Manufacturers, ${traderUsers} Traders`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Products",
      value: totalProducts,
      subtitle: "Across all manufacturers",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Budgets",
      value: totalBudgets,
      subtitle: `${pendingBudgets} Pending, ${approvedBudgets} Approved`,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: "From approved budgets",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Clients",
      value: totalClients,
      subtitle: "Active clients",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Providers",
      value: totalProviders,
      subtitle: "Registered providers",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and management</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => router.push("/admin/users")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-muted-foreground">Create, edit, and manage user accounts</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/products")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">View All Products</p>
                <p className="text-sm text-muted-foreground">Browse products from all manufacturers</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/budgets")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">View All Budgets</p>
                <p className="text-sm text-muted-foreground">Monitor all budget activity</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/export-tasks")}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Export Tasks</p>
                <p className="text-sm text-muted-foreground">View and manage export tasks</p>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgets?.slice(0, 5).map((budget: any) => (
                <div
                  key={budget.id}
                  className="flex items-center gap-3 text-sm p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push(`/budgets/${budget.id}`)}
                >
                  <div className={`w-2 h-2 rounded-full ${budget.status === "APPROVED" ? "bg-green-500" :
                      budget.status === "PENDING" ? "bg-yellow-500" :
                        "bg-gray-500"
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      Budget for {budget.client?.name || "Unknown"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      ${Number(budget.totalAmount).toLocaleString()} - {budget.status}
                    </p>
                  </div>
                </div>
              ))}
              {(!budgets || budgets.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
