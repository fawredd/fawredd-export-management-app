import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, Package, Truck, Shield, FileText, DollarSign } from 'lucide-react';
import type { ProductPricingResult, CostBreakdownItem } from '@/hooks/usePricingCalculator';

interface PricingBreakdownProps {
    result: ProductPricingResult;
    currency?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
    product: <Package className="h-4 w-4" />,
    freight: <Truck className="h-4 w-4" />,
    insurance: <Shield className="h-4 w-4" />,
    fixed: <FileText className="h-4 w-4" />,
    duty: <DollarSign className="h-4 w-4" />,
    prorated: <FileText className="h-4 w-4" />,
};

const typeBadgeColors: Record<string, string> = {
    product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    freight: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    insurance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    fixed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    duty: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    prorated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export function PricingBreakdown({ result, currency = 'USD' }: PricingBreakdownProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const includedItems = result.breakdown.filter((item) => item.includedInIncoterm);
    const excludedItems = result.breakdown.filter((item) => !item.includedInIncoterm);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.productName}</CardTitle>
                    <Badge variant="outline" className="text-sm">
                        Qty: {result.quantity}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Included Costs */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Included Costs</h4>
                    {includedItems.map((item, index) => (
                        <BreakdownItem key={index} item={item} currency={currency} />
                    ))}
                </div>

                {/* Excluded Costs (if any) */}
                {excludedItems.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                Not Included in This Incoterm
                            </h4>
                            {excludedItems.map((item, index) => (
                                <BreakdownItem key={index} item={item} currency={currency} excluded />
                            ))}
                        </div>
                    </>
                )}

                {/* Total */}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                    <div>
                        <p className="text-sm font-semibold">Unit Price</p>
                        <p className="text-xs text-muted-foreground">
                            Total: {formatCurrency(result.totalPrice)}
                        </p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(result.unitPrice)}</p>
                </div>
            </CardContent>
        </Card>
    );
}

interface BreakdownItemProps {
    item: CostBreakdownItem;
    currency: string;
    excluded?: boolean;
}

function BreakdownItem({ item, currency, excluded = false }: BreakdownItemProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div
            className={`flex items-center justify-between p-2 rounded-md ${excluded ? 'opacity-50 bg-muted/50' : 'bg-muted/30'
                }`}
        >
            <div className="flex items-center gap-2 flex-1">
                <div className={`p-1.5 rounded ${typeBadgeColors[item.type] || typeBadgeColors.fixed}`}>
                    {typeIcons[item.type] || typeIcons.fixed}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.description && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-xs">{item.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.amountPerUnit)} per unit
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(item.amountTotal)}</p>
                {excluded && <p className="text-xs text-muted-foreground">Excluded</p>}
            </div>
        </div>
    );
}

interface PricingSummaryProps {
    results: ProductPricingResult[];
    incoterm: string;
    metadata?: {
        totalFOB?: number;
        totalCIF?: number;
        totalDEX?: number;
    };
    currency?: string;
}

export function PricingSummary({ results, incoterm, metadata, currency = 'USD' }: PricingSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const grandTotal = results.reduce((sum, r) => sum + r.totalPrice, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Pricing Summary</span>
                    <Badge variant="default" className="text-sm">
                        {incoterm}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {metadata?.totalFOB && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">FOB Total:</span>
                        <span className="font-medium">{formatCurrency(metadata.totalFOB)}</span>
                    </div>
                )}
                {metadata?.totalDEX && metadata.totalDEX > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Export Duties (DEX):</span>
                        <span className="font-medium">{formatCurrency(metadata.totalDEX)}</span>
                    </div>
                )}
                {metadata?.totalCIF && incoterm === 'CIF' && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CIF Total:</span>
                        <span className="font-medium">{formatCurrency(metadata.totalCIF)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Grand Total:</span>
                    <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    {results.length} product{results.length !== 1 ? 's' : ''} • {incoterm} Incoterm
                </p>
            </CardContent>
        </Card>
    );
}
