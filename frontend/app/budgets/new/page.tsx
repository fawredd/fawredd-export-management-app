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
  costIds: z.array(z.string()).optional(),
})

type BudgetFormData = z.infer<typeof budgetSchema>

export default function NewBudgetPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isCreatingExpense, setIsCreatingExpense] = useState(false)
  const [expenses, setExpenses] = useState<Array<{ id?: string, description: string, value: number, isNew?: boolean }>>([])
  const [expenseSearch, setExpenseSearch] = useState("")
  const [newExpenseData, setNewExpenseData] = useState({ description: "", value: "" })
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

  const { data: costs } = useQuery({
    queryKey: ["costs"],
    queryFn: () => apiClient.getCosts(),
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
    onSuccess: (newBudget) => {
      toast.success("Budget created successfully")
      router.push(`/budgets/${newBudget.id}`)
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
      costIds: expenses.filter(e => e.id).map(e => e.id!),
      newExpenses: expenses.filter(e => e.isNew).map(e => ({ description: e.description, value: e.value, type: "FIXED" }))
    }
    mutation.mutate(payload)
  }

  // Calculate totals for preview
  const calculateTotals = () => {
    const items = watch("items") || []
    const subtotal = items.reduce((sum, item) => {
      const qty = Number.parseFloat(item.quantity) || 0
      const price = Number.parseFloat(item.unitPrice) || 0
      return sum + (qty * price)
    }, 0)

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.value), 0)

    const totalFOB = subtotal + totalExpenses

    return {
      subtotal,
      totalExpenses,
      totalFOB,
      totalCIF: totalFOB, // For CIF, freight/insurance already in expenses
    }
  }

  const totals = calculateTotals()

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
                    <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                    <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                    <SelectItem value="FOB">FOB - Free On Board</SelectItem>
                    <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
                    <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
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
                    onValueChange={(value) => {
                      setValue(`items.${index}.productId`, value)
                      // Auto-fill price
                      const product = products?.find((p: any) => p.id === value)
                      if (product && product.priceHistory && product.priceHistory.length > 0) {
                        const latestSelling = product.priceHistory.find((p: any) => p.type === 'SELLING')
                        if (latestSelling) {
                          setValue(`items.${index}.unitPrice`, latestSelling.value.toString())
                        }
                      }
                    }}
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
                  <Label>Selling Unit Price *</Label>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expenses & Services</CardTitle>
                <CardDescription>Add expenses one at a time (freight, insurance, customs, etc.)</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingExpense(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{expense.description}</div>
                      {expense.isNew && <div className="text-xs text-muted-foreground">New expense</div>}
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={expense.value}
                      onChange={(e) => {
                        const newExpenses = [...expenses]
                        newExpenses[index].value = Number(e.target.value)
                        setExpenses(newExpenses)
                      }}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpenses(expenses.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses added yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Preview</CardTitle>
            <CardDescription>Review your budget with final {watch("incoterm") || "FOB"} prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Products with final prices */}
            {watch("items")?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Products</Label>
                <div className="border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">{watch("incoterm") || "FOB"} Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {watch("items").map((item: any, index: number) => {
                        const product = products?.find((p: any) => p.id === item.productId)
                        const qty = Number(item.quantity) || 0
                        const unitPrice = Number(item.unitPrice) || 0
                        const proratedExpense = totals.totalExpenses / (watch("items")?.length || 1)
                        const finalPrice = watch("incoterm") === "EXW" || watch("incoterm") === "FCA"
                          ? unitPrice
                          : unitPrice + (proratedExpense / qty)
                        return (
                          <tr key={index}>
                            <td className="px-3 py-2">{product?.title || "Unknown"}</td>
                            <td className="px-3 py-2 text-right">{qty}</td>
                            <td className="px-3 py-2 text-right">${unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-medium">${(qty * finalPrice).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products Subtotal:</span>
                <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expenses & Services:</span>
                <span className="font-medium">${totals.totalExpenses.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>{watch("incoterm") || "FOB"} Total:</span>
                  <span>${(watch("incoterm") === "EXW" || watch("incoterm") === "FCA" ? totals.subtotal : totals.totalFOB).toFixed(2)}</span>
                </div>
              </div>
            </div>
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

      {/* Create Expense Dialog */}
      <Dialog open={isCreatingExpense} onOpenChange={setIsCreatingExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense/Service</DialogTitle>
            <DialogDescription>Add a new expense or select from existing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {costs && costs.length > 0 && (
              <div className="space-y-2">
                <Label>Select from existing</Label>
                <Input
                  placeholder="Search expenses..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {costs
                    .filter((c: any) => !expenses.find(e => e.id === c.id))
                    .filter((c: any) =>
                      !expenseSearch ||
                      (c.description?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                        c.type?.toLowerCase().includes(expenseSearch.toLowerCase()))
                    )
                    .map((cost: any) => (
                      <button
                        key={cost.id}
                        type="button"
                        onClick={() => {
                          setExpenses([...expenses, { id: cost.id, description: cost.description || cost.type, value: Number(cost.value) }])
                          setIsCreatingExpense(false)
                          setExpenseSearch("")
                        }}
                        className="w-full text-left p-2 rounded hover:bg-accent flex justify-between"
                      >
                        <span>{cost.description || cost.type}</span>
                        <span className="font-medium">${Number(cost.value).toFixed(2)}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
            <div className="border-t pt-4">
              <Label>Or create new</Label>
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Description (e.g., Freight, Insurance)"
                  value={newExpenseData.description}
                  onChange={(e) => setNewExpenseData({ ...newExpenseData, description: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  value={newExpenseData.value}
                  onChange={(e) => setNewExpenseData({ ...newExpenseData, value: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreatingExpense(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (newExpenseData.description && newExpenseData.value) {
                  setExpenses([...expenses, { description: newExpenseData.description, value: Number(newExpenseData.value), isNew: true }])
                  setNewExpenseData({ description: "", value: "" })
                  setIsCreatingExpense(false)
                }
              }}
              disabled={!newExpenseData.description || !newExpenseData.value}
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
