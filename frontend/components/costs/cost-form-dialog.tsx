"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Cost, CostType } from "@/shared/types"
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

const costSchema = z.object({
  type: z.enum(["FIXED", "VARIABLE", "FREIGHT", "INSURANCE"]),
  description: z.string().optional(),
  value: z.string().min(1, "Value is required"),
})

type CostFormData = z.infer<typeof costSchema>

interface CostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cost?: Cost
  onSuccess: () => void
}

export function CostFormDialog({ open, onOpenChange, cost, onSuccess }: CostFormDialogProps) {
  const isEditing = !!cost

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: cost
      ? {
          type: cost.type as CostType,
          description: cost.description || "",
          value: cost.value.toString(),
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: any) => (isEditing ? apiClient.updateCost(cost.id, data) : apiClient.createCost(data)),
    onSuccess: () => {
      reset()
      onSuccess()
    },
  })

  const onSubmit = (data: CostFormData) => {
    const payload = {
      type: data.type,
      description: data.description || undefined,
      value: Number.parseFloat(data.value),
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Cost" : "Add Cost"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update cost information" : "Add a new cost to your system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Cost Type *</Label>
            <Select value={watch("type")} onValueChange={(value) => setValue("type", value as CostType)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed Cost</SelectItem>
                <SelectItem value="VARIABLE">Variable Cost</SelectItem>
                <SelectItem value="FREIGHT">Freight Cost</SelectItem>
                <SelectItem value="INSURANCE">Insurance Cost</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value (USD) *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("value")}
              className="bg-background"
            />
            {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              {...register("description")}
              className="bg-background"
              rows={3}
            />
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
                "Update Cost"
              ) : (
                "Create Cost"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
