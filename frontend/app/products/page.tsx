"use client"

import type React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null)
  const [isCreatingTariff, setIsCreatingTariff] = useState(false)
  const [newTariffCode, setNewTariffCode] = useState("")
  const [newTariffDescription, setNewTariffDescription] = useState("")
  const [tariffCodeError, setTariffCodeError] = useState("")

  const [formData, setFormData] = useState({
    sku: "",
    title: "",
    description: "",
    weightKg: "",
    volumeM3: "",
    composition: "",
    tariffPositionId: "",
    unitId: "",
  })

  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(),
  })

  const { data: tariffPositions } = useQuery({
    queryKey: ["tariff-positions"],
    queryFn: () => apiClient.getTariffPositions(),
  })

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: () => apiClient.getUnitsOfMeasure(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("Product created successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setEditingProduct(null)
      resetForm()
      toast.success("Product updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setDeletingProduct(null)
      toast.success("Product deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product")
    },
  })

  const createTariffMutation = useMutation({
    mutationFn: (data: any) => apiClient.createTariffPosition(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tariff-positions"] })
      // Extract the tariff position from the response
      const newTariff = response.data || response
      setFormData({ ...formData, tariffPositionId: newTariff.id })
      setIsCreatingTariff(false)
      setNewTariffCode("")
      setNewTariffDescription("")
      setTariffCodeError("")
      toast.success("Tariff position created successfully")
    },
    onError: (error: any) => {
      // Handle validation errors from backend
      if (error.response?.data?.details) {
        const details = error.response.data.details
        const errorMsg = details.map((d: any) => d.message).join(", ")
        setTariffCodeError(errorMsg)
        toast.error(errorMsg)
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to create tariff position")
      }
    },
  })

  const resetForm = () => {
    setFormData({
      sku: "",
      title: "",
      description: "",
      weightKg: "",
      volumeM3: "",
      composition: "",
      tariffPositionId: "",
      unitId: "",
    })
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku || "",
      title: product.title || "",
      description: product.description || "",
      weightKg: product.weightKg?.toString() || "",
      volumeM3: product.volumeM3?.toString() || "",
      composition: product.composition || "",
      tariffPositionId: product.tariffPositionId || "",
      unitId: product.unitId || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      weightKg: formData.weightKg ? Number.parseFloat(formData.weightKg) : undefined,
      volumeM3: formData.volumeM3 ? Number.parseFloat(formData.volumeM3) : undefined,
      tariffPositionId: formData.tariffPositionId || undefined,
      unitId: formData.unitId || undefined,
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const validateTariffCode = (code: string): string => {
    if (!code) return ""
    if (code.length < 4) return "Tariff code must be at least 4 characters"
    if (code.length > 20) return "Tariff code must not exceed 20 characters"
    if (!/^[0-9.]+$/.test(code)) return "Only numbers and dots allowed"
    if (code.startsWith('.') || code.endsWith('.')) return "Cannot start or end with a dot"
    if (code.includes('..')) return "Cannot contain consecutive dots"
    return ""
  }

  const handleTariffCodeChange = (value: string) => {
    setNewTariffCode(value)
    setTariffCodeError(validateTariffCode(value))
  }

  const handleCreateTariff = () => {
    if (!newTariffCode || !newTariffDescription) {
      toast.error("Please fill in tariff code and description")
      return
    }
    const error = validateTariffCode(newTariffCode)
    if (error) {
      setTariffCodeError(error)
      toast.error(error)
      return
    }
    createTariffMutation.mutate({
      code: newTariffCode,
      description: newTariffDescription,
    })
  }

  const filteredProducts = products?.filter(
    (product: any) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const productColumns = [
    { header: "SKU", accessor: "sku" as const },
    { header: "Product Name", accessor: "title" as const },
    { header: "Weight (kg)", accessor: (row: any) => row.weightKg || "-" },
    { header: "Volume (m³)", accessor: (row: any) => row.volumeM3 || "-" },
    { header: "Tariff", accessor: (row: any) => row.tariffPosition?.code || "-" },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeletingProduct(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <DataTable data={filteredProducts || []} columns={productColumns} />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingProduct(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product information" : "Add a new product to your catalog"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Product Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.01"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volumeM3">Volume (m³)</Label>
                <Input
                  id="volumeM3"
                  type="number"
                  step="0.01"
                  value={formData.volumeM3}
                  onChange={(e) => setFormData({ ...formData, volumeM3: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="composition">Composition</Label>
              <Input
                id="composition"
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              />
            </div>

            {/* Tariff Position with Create Option */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tariffPositionId">Tariff Position</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsCreatingTariff(!isCreatingTariff)}
                  className="h-auto p-0"
                >
                  {isCreatingTariff ? "Cancel" : "+ Create New"}
                </Button>
              </div>

              {isCreatingTariff ? (
                <div className="space-y-2 p-3 border rounded-md bg-muted/50">
                  <div className="space-y-1">
                    <Input
                      placeholder="Tariff Code (e.g., 6204.62.00)"
                      value={newTariffCode}
                      onChange={(e) => handleTariffCodeChange(e.target.value)}
                      className={tariffCodeError ? "border-red-500" : ""}
                    />
                    {tariffCodeError && (
                      <p className="text-xs text-red-600">{tariffCodeError}</p>
                    )}
                    {!tariffCodeError && newTariffCode && (
                      <p className="text-xs text-green-600">✓ Valid format</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Format: XXXX.XX.XX (numbers and dots only)
                    </p>
                  </div>
                  <Input
                    placeholder="Description"
                    value={newTariffDescription}
                    onChange={(e) => setNewTariffDescription(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTariff}
                    disabled={createTariffMutation.isPending || !!tariffCodeError}
                  >
                    {createTariffMutation.isPending ? "Creating..." : "Create Tariff"}
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.tariffPositionId}
                  onValueChange={(value) => setFormData({ ...formData, tariffPositionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tariff position" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(tariffPositions) ? tariffPositions : tariffPositions?.data)?.map((tariff: any) => (
                      <SelectItem key={tariff.id} value={tariff.id}>
                        {tariff.code} - {tariff.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit of Measure</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => setFormData({ ...formData, unitId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(units) ? units : units?.data)?.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setEditingProduct(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingProduct
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
