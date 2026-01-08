"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, MoreVertical, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BudgetStatus } from "@/shared/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const statusColors: Record<BudgetStatus, string> = {
  DRAFT: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  SENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VIEWED: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  EXPIRED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  INVOICED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default function BudgetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.getBudgets(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/budgets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Budget status updated")
    },
    onError: () => {
      toast.error("Failed to update status")
    },
  })

  const filteredBudgets = budgets?.filter((budget: any) =>
    budget.client?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Budgets"
          description="Create incoterm-aware budgets with cost calculations"
          action={{
            label: "Create Budget",
            onClick: () => router.push("/budgets/new"),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search budgets by client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading budgets...</p>
              </div>
            ) : filteredBudgets && filteredBudgets.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Budget ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Incoterm</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget: any) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-mono text-sm">{budget.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{budget.client?.name || "Unknown"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{budget.incoterm}</Badge>
                        </TableCell>
                        <TableCell>
                          {budget.totalAmount ? (
                            <span className="font-medium">${budget.totalAmount}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={budget.status}
                            onValueChange={(value) => updateStatusMutation.mutate({ id: budget.id, status: value as BudgetStatus })}
                          >
                            <SelectTrigger className={`w-[180px] ${statusColors[budget.status as BudgetStatus]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="SENT">Sent</SelectItem>
                              <SelectItem value="VIEWED">Viewed</SelectItem>
                              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                              <SelectItem value="APPROVED">Approved</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                              <SelectItem value="EXPIRED">Expired</SelectItem>
                              <SelectItem value="INVOICED">Invoiced</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(budget.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/budgets/${budget.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">No budgets found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by creating your first budget"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push("/budgets/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
