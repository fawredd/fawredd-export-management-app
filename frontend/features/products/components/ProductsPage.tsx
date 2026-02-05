"use client"

import type React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { productsApi } from "../api/products-api"
import { DataTable } from "@/components/data-display/DataTable"
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
import { apiClient } from "@/lib/api/client"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null)
  const [isCreatingTariff, setIsCreatingTariff] = useState(false)
  const [newTariffCode, setNewTariffCode] = useState("")
  const [newTariffDescription, setNewTariffDescription] = useState("")
  const [tariffCodeError, setTariffCodeError] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const [formData, setFormData] = useState({
    sku: "",
    title: "",
    description: "",
    weightKg: "",
    volumeM3: "",
    composition: "",
    tariffPositionId: "",
    unitId: "",
    costPrice: "",
    sellingPrice: "",
  })

  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
  })

  const { data: tariffPositions } = useQuery({
    queryKey: ["tariff-positions"],
    queryFn: () => apiClient.get('/api/tariff-positions').then(res => res.data),
  })

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: () => apiClient.get('/api/units').then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.createProduct(data),
    onSuccess: (newProduct) => {
      // If there are files selected, upload them now
      if (selectedFiles && selectedFiles.length > 0) {
        uploadImagesMutation.mutate({ productId: newProduct.id, files: selectedFiles })
      } else {
        queryClient.invalidateQueries({ queryKey: ["products"] })
        setIsCreateDialogOpen(false)
        resetForm()
        toast.success("Product created successfully")
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // If there are files selected, upload them now
      if (selectedFiles && selectedFiles.length > 0) {
        uploadImagesMutation.mutate({ productId: updatedProduct.id, files: selectedFiles })
      } else {
        queryClient.invalidateQueries({ queryKey: ["products"] })
        setEditingProduct(null)
        resetForm()
        toast.success("Product updated successfully")
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setDeletingProduct(null)
      toast.success("Product deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product")
    },
  })

  const uploadImagesMutation = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: FileList }) => {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('images', file))
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(res => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setSelectedFiles(null)
      setIsCreateDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      toast.success("Product saved with images")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images")
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageUrl }: { productId: string; imageUrl: string }) => 
      productsApi.deleteProductImage(productId, imageUrl),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      // Update local state to reflect change immediately if needed, 
      // but invalidating query is safer to sync with backend
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          imageUrls: editingProduct.imageUrls.filter((url: string) => url !== data.product.imageUrls.find((u: string) => !editingProduct.imageUrls.includes(u))) 
          // Actually the backend returns the updated product, so we can just update editingProduct
          // But wait, the backend response format in controller is { message, product }
          // Let's rely on the invalidated query or update from response
        })
        // A simpler way is to just close and reopen or let the query update the list. 
        // Since we are inside the dialog, we need the editingProduct state to update.
        // The backend returns { message, product }.
        setEditingProduct(data.product)
      }
      toast.success("Image deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete image")
    },
  })

  const createTariffMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/tariff-positions', data).then(res => res.data),
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
      costPrice: "",
      sellingPrice: "",
    })
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    // Get latest prices from price history
    const latestCost = product.priceHistory?.find((p: any) => p.type === 'COST')
    const latestSelling = product.priceHistory?.find((p: any) => p.type === 'SELLING')

    setFormData({
      sku: product.sku || "",
      title: product.title || "",
      description: product.description || "",
      weightKg: product.weightKg?.toString() || "",
      volumeM3: product.volumeM3?.toString() || "",
      composition: product.composition || "",
      tariffPositionId: product.tariffPositionId || "",
      unitId: product.unitId || "",
      costPrice: latestCost?.value?.toString() || "",
      sellingPrice: latestSelling?.value?.toString() || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      weightKg: formData.weightKg ? Number.parseFloat(formData.weightKg) : undefined,
      volumeM3: formData.volumeM3 ? Number.parseFloat(formData.volumeM3) : undefined,
      costPrice: formData.costPrice ? Number.parseFloat(formData.costPrice) : undefined,
      sellingPrice: formData.sellingPrice ? Number.parseFloat(formData.sellingPrice) : undefined,
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

  const [tariffFilter, setTariffFilter] = useState("ALL")

  const filteredProducts = products?.filter(
    (product: any) =>
      (product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (tariffFilter === "ALL" || product.tariffPositionId === tariffFilter)
  )

  const productColumns = [
    {
      header: "",
      accessor: (row: any) => (
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
          {row.imageUrls && row.imageUrls.length > 0 ? (
            <img src={row.imageUrls[0]} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No img</span>
          )}
        </div>
      ),
      className: "w-12"
    },
    { header: "SKU", accessor: "sku" as const },
    { header: "Product Name", accessor: "title" as const },
    {
      header: "Cost Price",
      accessor: (row: any) => {
        const price = row.priceHistory?.find((p: any) => p.type === 'COST');
        return price ? `$${Number(price.value).toFixed(2)}` : "-";
      }
    },
    {
      header: "Selling Price",
      accessor: (row: any) => {
        const price = row.priceHistory?.find((p: any) => p.type === 'SELLING');
        return price ? `$${Number(price.value).toFixed(2)}` : "-";
      }
    },
    { header: "Weight (kg)", accessor: (row: any) => row.weightKg || "-" },
    { header: "Volume (m³)", accessor: (row: any) => row.volumeM3 || "-" },
    { header: "Tariff", accessor: (row: any) => row.tariffPosition?.code || "-" },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
            <div className="w-[200px]">
              <Select value={tariffFilter} onValueChange={setTariffFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Tariff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tariffs</SelectItem>
                  {(Array.isArray(tariffPositions) ? tariffPositions : tariffPositions?.data)?.map((tariff: any) => (
                    <SelectItem key={tariff.id} value={tariff.id}>
                      {tariff.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <DataTable
              data={filteredProducts || []}
              columns={productColumns}
              onRowClick={handleEdit}
            />
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
            {/* Image Upload Section - Moved to Top */}
            <div className="space-y-2 p-4 border rounded-md bg-muted/20">
              <Label>Product Images</Label>
              <div className="space-y-4">
                {/* Existing Images (Edit Mode) */}
                {editingProduct && editingProduct.imageUrls && editingProduct.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Current Images</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.imageUrls.map((url: string, index: number) => (
                        <div key={index} className="relative group aspect-square">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this image?")) {
                                deleteImageMutation.mutate({ productId: editingProduct.id, imageUrl: url })
                              }
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {editingProduct ? "Add More Images" : "Select Images"}
                  </Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFiles(e.target.files)
                      }
                    }}
                    className="cursor-pointer"
                  />

                  {/* Preview of Selected Files */}
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover rounded border opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">New</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
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

            {/* Price History - Only show when editing */}
            {editingProduct && editingProduct.priceHistory && editingProduct.priceHistory.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Price History</Label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Type</th>
                        <th className="px-3 py-2 text-right font-medium">Price</th>
                        <th className="px-3 py-2 text-right font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {editingProduct.priceHistory.map((history: any) => (
                        <tr key={history.id}>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${history.type === 'COST' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {history.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            ${Number(history.value).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            {new Date(history.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setEditingProduct(null)
                  resetForm()
                  setSelectedFiles(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploadImagesMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending || uploadImagesMutation.isPending
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
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
