/**
 * Test vectors for pricing calculator
 * Use these to verify calculations are correct
 */

export const testVectors = [
    {
        name: 'Simple FOB - Single Product',
        input: {
            products: [
                {
                    productId: 'prod_1',
                    basePrice: 10.00,
                    quantity: 100,
                    tariffPosition: {
                        adValoremRate: 5, // 5% export duty
                    },
                },
            ],
            expenses: [
                {
                    id: 'exp_1',
                    type: 'FIXED',
                    description: 'Customs Broker',
                    value: 200,
                    prorate: true,
                    perUnitOrTotal: 'TOTAL',
                    incotermToBeIncluded: { name: 'FOB' },
                },
            ],
            incoterm: 'FOB',
        },
        expected: {
            products: [
                {
                    unitPrice: 12.63, // 10 + 2 (prorated) + 0.63 (DEX on 1200)
                    totalPrice: 1263.00,
                    breakdown: [
                        { label: 'Base Export Price (BEP)', amountPerUnit: 10.00, amountTotal: 1000.00 },
                        { label: 'Customs Broker (prorated)', amountPerUnit: 2.00, amountTotal: 200.00 },
                        { label: 'Export Duty (DEX)', amountPerUnit: 0.63, amountTotal: 63.00 }, // 5% of 1260
                    ],
                },
            ],
        },
    },

    {
        name: 'CIF - Multiple Products with Freight/Insurance',
        input: {
            products: [
                { productId: 'prod_1', basePrice: 10.00, quantity: 100 },
                { productId: 'prod_2', basePrice: 20.00, quantity: 50 },
            ],
            expenses: [
                {
                    id: 'exp_1',
                    type: 'FIXED',
                    description: 'Local Transport',
                    value: 300,
                    prorate: true,
                    incotermToBeIncluded: { name: 'FCA' },
                },
                {
                    id: 'exp_2',
                    type: 'FREIGHT',
                    description: 'Ocean Freight',
                    value: 500,
                    prorate: false,
                    perUnitOrTotal: 'TOTAL',
                    incotermToBeIncluded: { name: 'CIF' },
                },
                {
                    id: 'exp_3',
                    type: 'INSURANCE',
                    description: 'Marine Insurance',
                    value: 100,
                    prorate: false,
                    perUnitOrTotal: 'TOTAL',
                    incotermToBeIncluded: { name: 'CIF' },
                },
            ],
            incoterm: 'CIF',
        },
        expected: {
            // Product 1: 1000 value = 50% of total (2000)
            // Gets 50% of prorated expenses = 150
            // Freight/Insurance distributed: 500/150 units = 3.33/unit, 100/150 = 0.67/unit
            products: [
                {
                    productId: 'prod_1',
                    unitPrice: 15.50, // 10 + 1.50 (prorated) + 3.33 (freight) + 0.67 (insurance)
                    totalPrice: 1550.00,
                },
                {
                    productId: 'prod_2',
                    unitPrice: 26.50, // 20 + 3.00 (prorated) + 3.33 (freight) + 0.67 (insurance)
                    totalPrice: 1325.00,
                },
            ],
            metadata: {
                totalFOB: 2450.00, // Products + local expenses
                totalCIF: 3050.00, // FOB + freight + insurance
            },
        },
    },

    {
        name: 'DEX with Min/Max Constraints',
        input: {
            products: [
                {
                    productId: 'prod_1',
                    basePrice: 5.00,
                    quantity: 10,
                    tariffPosition: {
                        adValoremRate: 10, // 10%
                        fixedExportDuty: 10,
                        exportDutyMinAmount: 50, // Minimum duty
                        exportDutyMaxAmount: 1000,
                    },
                },
            ],
            expenses: [],
            incoterm: 'FOB',
        },
        expected: {
            // FOB value = 50
            // Calculated DEX = (50 * 0.10) + 10 = 15
            // But min is 50, so DEX = 50
            products: [
                {
                    unitPrice: 10.00, // 5 + 5 (DEX applied min)
                    breakdown: [
                        { label: 'Base Export Price (BEP)', amountPerUnit: 5.00 },
                        { label: 'Export Duty (DEX)', amountPerUnit: 5.00, amountTotal: 50.00 },
                    ],
                },
            ],
        },
    },

    {
        name: 'EXW - No Expenses Included',
        input: {
            products: [
                { productId: 'prod_1', basePrice: 10.00, quantity: 100 },
            ],
            expenses: [
                {
                    id: 'exp_1',
                    type: 'FIXED',
                    value: 200,
                    incotermToBeIncluded: { name: 'FCA' }, // Not included in EXW
                },
            ],
            incoterm: 'EXW',
        },
        expected: {
            products: [
                {
                    unitPrice: 10.00, // Only base price
                    totalPrice: 1000.00,
                    breakdown: [
                        { label: 'Base Export Price (BEP)', amountPerUnit: 10.00, includedInIncoterm: true },
                        { label: 'Fixed Cost', amountPerUnit: 2.00, includedInIncoterm: false }, // Shown but not included
                    ],
                },
            ],
        },
    },

    {
        name: 'VAT Adjustment',
        input: {
            products: [
                { productId: 'prod_1', basePrice: 121.00, quantity: 100 }, // Price includes 21% VAT
            ],
            expenses: [],
            incoterm: 'FOB',
            config: {
                adjustForVAT: true,
                vatRate: 21,
            },
        },
        expected: {
            products: [
                {
                    unitPrice: 100.00, // 121 / 1.21 = 100
                    totalPrice: 10000.00,
                },
            ],
        },
    },
];

/**
 * How to use test vectors:
 * 
 * 1. Set up test data in database (products, tariff positions, expenses)
 * 2. Call pricing API with test vector input
 * 3. Compare response with expected output
 * 4. Verify calculations match within precision tolerance (±0.01)
 */
