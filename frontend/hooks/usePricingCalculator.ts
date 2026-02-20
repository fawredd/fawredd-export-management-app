import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Types for pricing calculator
 */
export interface ProductPricingInput {
    productId: string;
    quantity: number;
    basePrice?: number;
}

export interface PricingCalculationRequest {
    products: ProductPricingInput[];
    expenses: string[];
    incoterm: string;
    currency?: string;
    exchangeRate?: number;
}

export interface CostBreakdownItem {
    label: string;
    type: 'product' | 'freight' | 'insurance' | 'fixed' | 'duty' | 'prorated';
    amountPerUnit: number;
    amountTotal: number;
    includedInIncoterm: boolean;
    description?: string;
}

export interface ProductPricingResult {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    breakdown: CostBreakdownItem[];
}

export interface PricingCalculationResponse {
    incoterm: string;
    products: ProductPricingResult[];
    metadata: {
        currency: string;
        precision: number;
        roundingMode: string;
        calculatedAt: string;
        totalFOB?: number;
        totalCIF?: number;
        totalDEX?: number;
    };
}

export interface PricingConfig {
    adjustForVAT: boolean;
    vatRate?: number;
    baseCurrency: string;
    roundingMode: 'HALF_UP' | 'DOWN' | 'UP';
    precision: number;
}

export interface Incoterm {
    id: string;
    name: string;
    previousIncoterm?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

/**
 * Hook to calculate export pricing
 */
export function usePricingCalculator() {
    const calculatePricing = useMutation({
        mutationFn: async (request: PricingCalculationRequest) => {
            return apiClient.calculatePricing(request) as Promise<PricingCalculationResponse>;
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to calculate pricing');
        },
    });

    const calculateBatch = useMutation({
        mutationFn: async (scenarios: PricingCalculationRequest[]) => {
            return apiClient.calculateBatchPricing({ scenarios }) as Promise<{ scenarios: PricingCalculationResponse[] }>;
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to calculate batch pricing');
        },
    });

    return {
        calculatePricing,
        calculateBatch,
    };
}

/**
 * Hook to get pricing configuration
 */
export function usePricingConfig() {
    const queryClient = useQueryClient();

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['pricing-config'],
        queryFn: () => apiClient.getPricingConfig() as Promise<PricingConfig>,
    });

    const updateConfig = useMutation({
        mutationFn: async (updates: Partial<PricingConfig>) => {
            return apiClient.updatePricingConfig(updates) as Promise<PricingConfig>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-config'] });
            toast.success('Pricing configuration updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update configuration');
        },
    });

    return {
        config,
        isLoading,
        error,
        updateConfig,
    };
}

/**
 * Hook to get available Incoterms
 */
export function useIncoterms() {
    const { data: incoterms, isLoading, error } = useQuery({
        queryKey: ['incoterms'],
        queryFn: () => apiClient.getIncoterms() as Promise<Incoterm[]>,
    });

    return {
        incoterms: incoterms || [],
        isLoading,
        error,
    };
}
