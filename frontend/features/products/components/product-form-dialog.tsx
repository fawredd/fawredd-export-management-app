"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Product } from "@/shared/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  weightKg: z.string().optional(),
  volumeM3: z.string().optional(),
  composition: z.string().optional(),
  tariffPositionId: z.string().optional(),
  unitId: z.string().optional(),
  providerId: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSuccess: () => void
}

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: ProductFormDialogProps) {
  const isEditing = !!product

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: () => apiClient.getProviders(),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          title: product.title,
          description: product.description || "",
          weightKg: product.weightKg?.toString() || "",
          volumeM3: product.volumeM3?.toString() || "",
          composition: product.composition || "",
          tariffPositionId: product.tariffPositionId || "",
          unitId: product.unitId || "",
          providerId: product.providerId || "",
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: any) => (isEditing ? apiClient.updateProduct(product.id, data) : apiClient.createProduct(data)),
    onSuccess: () => {
      reset()
      onSuccess()
    },
  })

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      weightKg: data.weightKg ? Number.parseFloat(data.weightKg) : undefined,
      volumeM3: data.volumeM3 ? Number.parseFloat(data.volumeM3) : undefined,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product information" : "Add a new product to your catalog"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" placeholder="PROD-001" {...register("sku")} className="bg-background" />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Product Name *</Label>
              <Input id="title" placeholder="Product name" {...register("title")} className="bg-background" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description"
              {...register("description")}
              className="bg-background"
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
                placeholder="0.00"
                {...register("weightKg")}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volumeM3">Volume (m³)</Label>
              <Input
                id="volumeM3"
                type="number"
                step="0.001"
                placeholder="0.000"
                {...register("volumeM3")}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="composition">Composition</Label>
            <Input
              id="composition"
              placeholder="Material composition"
              {...register("composition")}
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tariffPositionId">Tariff Position</Label>
              <Input
                id="tariffPositionId"
                placeholder="HS Code"
                {...register("tariffPositionId")}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerId">Provider</Label>
              <Select value={watch("providerId")} onValueChange={(value) => setValue("providerId", value)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
