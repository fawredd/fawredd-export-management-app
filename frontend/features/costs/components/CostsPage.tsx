"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, DollarSign, Edit, Trash2, MoreVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Cost, CostType } from "@/shared/types"
import { CostFormDialog } from "./cost-form-dialog"

const costTypeColors: Record<CostType, string> = {
  FIXED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VARIABLE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  FREIGHT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  INSURANCE: "bg-green-500/10 text-green-500 border-green-500/20",
}

export default function CostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [deletingCost, setDeletingCost] = useState<Cost | null>(null)
  const queryClient = useQueryClient()

  const { data: costs, isLoading } = useQuery({
    queryKey: ["costs"],
    queryFn: () => apiClient.getCosts(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs"] })
      setDeletingCost(null)
    },
  })

  const filteredCosts = costs?.filter(
    (cost: Cost) =>
      cost.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cost.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Costs"
          description="Manage fixed, variable, freight, and insurance costs"
          action={{
            label: "Add Cost",
            onClick: () => setIsCreateDialogOpen(true),
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search costs by type or description..."
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
                <p className="text-muted-foreground">Loading costs...</p>
              </div>
            ) : filteredCosts && filteredCosts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCosts.map((cost: Cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Badge variant="outline" className={costTypeColors[cost.type]}>
                            {cost.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {cost.description ? (
                              <p className="text-sm">{cost.description}</p>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${cost.value.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(cost.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingCost(cost)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingCost(cost)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
                <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">No costs found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by adding your first cost"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Cost
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CostFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["costs"] })
          setIsCreateDialogOpen(false)
        }}
      />

      <CostFormDialog
        open={!!editingCost}
        onOpenChange={(open) => !open && setEditingCost(null)}
        cost={editingCost || undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["costs"] })
          setEditingCost(null)
        }}
      />

      <Dialog open={!!deletingCost} onOpenChange={(open) => !open && setDeletingCost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cost</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deletingCost?.type.toLowerCase()} cost? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCost(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCost && deleteMutation.mutate(deletingCost.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
