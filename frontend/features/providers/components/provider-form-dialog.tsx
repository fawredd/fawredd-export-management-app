"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Provider } from "@/shared/types"
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
import { Loader2 } from "lucide-react"

const providerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
})

type ProviderFormData = z.infer<typeof providerSchema>

interface ProviderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: Provider
  onSuccess: () => void
}

export function ProviderFormDialog({ open, onOpenChange, provider, onSuccess }: ProviderFormDialogProps) {
  const isEditing = !!provider

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: provider
      ? {
          name: provider.name,
          email: provider.email || "",
          phone: provider.phone || "",
          address: provider.address || "",
          taxId: provider.taxId || "",
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? apiClient.updateProvider(provider.id, data) : apiClient.createProvider(data),
    onSuccess: () => {
      reset()
      onSuccess()
    },
  })

  const onSubmit = (data: ProviderFormData) => {
    const payload = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      taxId: data.taxId || undefined,
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Provider" : "Add Provider"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update provider information" : "Add a new supplier to your network"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input id="name" placeholder="Acme Corporation" {...register("name")} className="bg-background" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@provider.com"
                {...register("email")}
                className="bg-background"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} className="bg-background" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address, city, country"
              {...register("address")}
              className="bg-background"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / VAT Number</Label>
            <Input id="taxId" placeholder="XX-XXXXXXX" {...register("taxId")} className="bg-background" />
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
                "Update Provider"
              ) : (
                "Create Provider"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
