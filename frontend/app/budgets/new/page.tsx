"use client"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Incoterm } from "@/shared/types"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const budgetSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  incoterm: z.nativeEnum(Incoterm),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.string().min(1, "Quantity is required"),
        unitPrice: z.string().min(1, "Unit price is required"),
      }),
    )
    .min(1, "At least one item is required"),
})

type BudgetFormData = z.infer<typeof budgetSchema>

export default function NewBudgetPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
  })
  const [newProductData, setNewProductData] = useState({
    sku: "",
    title: "",
    description: "",
  })

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiClient.getClients(),
  })

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      items: [{ productId: "", quantity: "", unitPrice: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.createBudget(data),
    onSuccess: () => {
      toast.success("Budget created successfully")
      router.push("/budgets")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create budget")
    },
  })

  const createClientMutation = useMutation({
    mutationFn: (data: any) => apiClient.createClient(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      setValue("clientId", newClient.id)
      setIsCreatingClient(false)
      setNewClientData({ name: "", email: "", phone: "", address: "", taxId: "" })
      toast.success("Client created successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create client")
    },
  })

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsCreatingProduct(false)
      setNewProductData({ sku: "", title: "", description: "" })
      toast.success("Product created successfully - you can now select it")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product")
    },
  })

  const onSubmit = (data: BudgetFormData) => {
    const payload = {
      clientId: data.clientId,
      incoterm: data.incoterm,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: Number.parseInt(item.quantity),
        unitPrice: Number.parseFloat(item.unitPrice),
      })),
    }
    mutation.mutate(payload)
  }

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    createClientMutation.mutate(newClientData)
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    createProductMutation.mutate(newProductData)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Budget" description="Create a new export budget with cost calculations" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
            <CardDescription>Select the client and incoterm for this budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="clientId">Client *</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setIsCreatingClient(true)}
                    className="h-auto p-0"
                  >
                    + Create New Client
                  </Button>
                </div>
                <Select value={watch("clientId")} onValueChange={(value) => setValue("clientId", value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="incoterm">Incoterm *</Label>
                <Select value={watch("incoterm")} onValueChange={(value) => setValue("incoterm", value as Incoterm)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB - Free On Board</SelectItem>
                    <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
                  </SelectContent>
                </Select>
                {errors.incoterm && <p className="text-sm text-destructive">{errors.incoterm.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Items</CardTitle>
                <CardDescription>Add products to this budget</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingProduct(true)}
                >
                  + New Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: "", unitPrice: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Product *</Label>
                  <Select
                    value={watch(`items.${index}.productId`)}
                    onValueChange={(value) => setValue(`items.${index}.productId`, value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.productId && (
                    <p className="text-sm text-destructive">{errors.items[index]?.productId?.message}</p>
                  )}
                </div>

                <div className="w-32 space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register(`items.${index}.quantity`)}
                    className="bg-background"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>

                <div className="w-40 space-y-2">
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register(`items.${index}.unitPrice`)}
                    className="bg-background"
                  />
                  {errors.items?.[index]?.unitPrice && (
                    <p className="text-sm text-destructive">{errors.items[index]?.unitPrice?.message}</p>
                  )}
                </div>

                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/budgets")}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Budget"
            )}
          </Button>
        </div>
      </form>

      {/* Create Client Dialog */}
      <Dialog open={isCreatingClient} onOpenChange={setIsCreatingClient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>Add a new client to select for this budget</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Name *</Label>
              <Input
                id="clientName"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={newClientData.address}
                onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientTaxId">Tax ID</Label>
              <Input
                id="clientTaxId"
                value={newClientData.taxId}
                onChange={(e) => setNewClientData({ ...newClientData, taxId: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatingClient(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={isCreatingProduct} onOpenChange={setIsCreatingProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>Add a new product to select for this budget</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productSku">SKU *</Label>
                <Input
                  id="productSku"
                  value={newProductData.sku}
                  onChange={(e) => setNewProductData({ ...newProductData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productTitle">Product Name *</Label>
                <Input
                  id="productTitle"
                  value={newProductData.title}
                  onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={newProductData.description}
                onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatingProduct(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
