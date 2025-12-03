"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BudgetDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const budgetId = params.id as string

    const { data: budget, isLoading } = useQuery({
        queryKey: ["budget", budgetId],
        queryFn: () => apiClient.getBudget(budgetId),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading budget...</p>
            </div>
        )
    }

    if (!budget) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h2 className="text-2xl font-bold">Budget Not Found</h2>
                <p className="text-muted-foreground">The budget you're looking for doesn't exist.</p>
                <Button onClick={() => router.push("/budgets")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Budgets
                </Button>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: "bg-gray-500",
            SENT: "bg-blue-500",
            VIEWED: "bg-purple-500",
            PENDING_APPROVAL: "bg-yellow-500",
            APPROVED: "bg-green-500",
            REJECTED: "bg-red-500",
            EXPIRED: "bg-gray-400",
            INVOICED: "bg-indigo-500",
        }
        return colors[status] || "bg-gray-500"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title={`Budget #${budget.id.slice(0, 8)}`}
                    description={`Created on ${new Date(budget.createdAt).toLocaleDateString()}`}
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/budgets")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const shareUrl = `${window.location.origin}/budgets/${budget.id}`
                            navigator.clipboard.writeText(shareUrl)
                            alert("Share link copied to clipboard!")
                        }}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.print()
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{budget.client?.name || "N/A"}</p>
                        {budget.client?.email && (
                            <p className="text-sm text-muted-foreground">{budget.client.email}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Incoterm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{budget.incoterm}</p>
                        <p className="text-sm text-muted-foreground">Delivery terms</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Budget Items</CardTitle>
                    <CardDescription>Products included in this budget</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead className="text-right">Prorated Costs</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budget.budgetItems?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.product?.title || "N/A"}
                                        <br />
                                        <span className="text-sm text-muted-foreground">{item.product?.sku}</span>
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">${Number(item.proratedCosts).toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        ${Number(item.totalLine).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {budget.costs && budget.costs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses & Services</CardTitle>
                        <CardDescription>Additional costs included in this budget</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {budget.costs.map((cost: any) => (
                                <div key={cost.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{cost.name}</p>
                                        {cost.description && (
                                            <p className="text-sm text-muted-foreground">{cost.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${Number(cost.value).toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">{cost.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                    <CardDescription>Cost breakdown by Incoterm: {budget.incoterm}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Products Subtotal */}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Products Subtotal:</span>
                        <span className="font-medium">
                            ${budget.budgetItems?.reduce((sum: number, item: any) =>
                                sum + (item.quantity * Number(item.unitPrice)), 0).toFixed(2) || "0.00"}
                        </span>
                    </div>

                    {/* Logic for different Incoterms */}
                    {(() => {
                        const subtotal = budget.budgetItems?.reduce((sum: number, item: any) => sum + (item.quantity * Number(item.unitPrice)), 0) || 0
                        const costs = budget.costs || []

                        const freight = costs.filter((c: any) => c.type === "FREIGHT").reduce((sum: number, c: any) => sum + Number(c.value), 0)
                        const insurance = costs.filter((c: any) => c.type === "INSURANCE").reduce((sum: number, c: any) => sum + Number(c.value), 0)
                        const localCosts = costs.filter((c: any) => !["FREIGHT", "INSURANCE"].includes(c.type)).reduce((sum: number, c: any) => sum + Number(c.value), 0)

                        const totalFOB = subtotal + localCosts

                        if (budget.incoterm === "EXW" || budget.incoterm === "FCA") {
                            return (
                                <>
                                    {localCosts > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Additional Expenses:</span>
                                            <span>${localCosts.toFixed(2)}</span>
                                        </div>
                                    )}
                                </>
                            )
                        }

                        if (budget.incoterm === "FOB") {
                            return (
                                <>
                                    {localCosts > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Local Costs (Included):</span>
                                            <span className="font-medium">${localCosts.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>FOB Total:</span>
                                        <span>${totalFOB.toFixed(2)}</span>
                                    </div>
                                </>
                            )
                        }

                        if (["CIF", "CFR", "CPT", "CIP", "DDP", "DAP"].includes(budget.incoterm)) {
                            return (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">FOB Subtotal:</span>
                                        <span className="font-medium">${totalFOB.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Freight:</span>
                                        <span className="font-medium">${freight.toFixed(2)}</span>
                                    </div>

                                    {["CIF", "CIP", "DDP"].includes(budget.incoterm) && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Insurance:</span>
                                            <span className="font-medium">${insurance.toFixed(2)}</span>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    })()}

                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total Amount ({budget.incoterm}):</span>
                        <span className="text-primary">
                            ${budget.totalAmount ? Number(budget.totalAmount).toFixed(2) : "0.00"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
