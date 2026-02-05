import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Comprehensive seed script for the Export Management application
 * Combines all seed data including Incoterms, organizations, users, products, etc.
 */

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // 1. Seed Organization
    console.log('📦 Seeding Organization...');
    const org = await prisma.organization.upsert({
        where: { id: 'org001' },
        update: {},
        create: {
            id: 'org001',
            name: 'Default Org',
            plan: 'FREE',
        },
    });
    console.log('✓ Organization created\n');

    // 2. Seed Users (password: Admin123!)
    console.log('👥 Seeding Users...');
    const hashedPassword = '$2a$10$L.M3ueHTu.CQdzmUsIKKr.wzF5RjoyO04dF0LYKGM50q8nFGUgaHy';

    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            id: 'admin001',
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'ADMIN',
        },
    });

    await prisma.user.upsert({
        where: { email: 'man01@example.com' },
        update: {},
        create: {
            id: 'manufacturer001',
            email: 'man01@example.com',
            password: hashedPassword,
            name: 'MANUFACTURER',
            role: 'MANUFACTURER',
            organizationId: 'org001',
        },
    });

    await prisma.user.upsert({
        where: { email: 'trader@example.com' },
        update: {},
        create: {
            id: 'trader001',
            email: 'trader@example.com',
            password: hashedPassword,
            name: 'John Trader',
            role: 'TRADER',
            organizationId: 'org001',
        },
    });

    await prisma.user.upsert({
        where: { email: 'manufacturer@example.com' },
        update: {},
        create: {
            id: 'manufacturer002',
            email: 'manufacturer@example.com',
            password: hashedPassword,
            name: 'Maria Manufacturer',
            role: 'MANUFACTURER',
            organizationId: 'org001',
        },
    });

    await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: {
            id: 'client001user',
            email: 'client@example.com',
            password: hashedPassword,
            name: 'Client User',
            role: 'CLIENT',
            organizationId: 'org001',
        },
    });
    console.log('✓ Users created\n');

    // 3. Seed Countries
    console.log('🌍 Seeding Countries...');
    const countries = [
        { id: 'country001', name: 'United States', code: 'US' },
        { id: 'country002', name: 'Brazil', code: 'BR' },
        { id: 'country003', name: 'China', code: 'CN' },
        { id: 'country004', name: 'Germany', code: 'DE' },
        { id: 'country005', name: 'Chile', code: 'CL' },
    ];

    for (const country of countries) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: {},
            create: country,
        });
    }
    console.log('✓ Countries created\n');

    // 4. Seed Units of Measure
    console.log('📏 Seeding Units of Measure...');
    const units = [
        { id: 'unit001', name: 'Kilogram', abbreviation: 'kg' },
        { id: 'unit002', name: 'Liter', abbreviation: 'L' },
        { id: 'unit003', name: 'Unit', abbreviation: 'un' },
        { id: 'unit004', name: 'Ton', abbreviation: 't' },
        { id: 'unit005', name: 'Box', abbreviation: 'box' },
    ];

    for (const unit of units) {
        await prisma.unitOfMeasure.upsert({
            where: { abbreviation: unit.abbreviation },
            update: {},
            create: unit,
        });
    }
    console.log('✓ Units of Measure created\n');

    // 5. Seed Tariff Positions (with new export duty fields)
    console.log('📋 Seeding Tariff Positions...');
    await prisma.tariffPosition.upsert({
        where: { code: '0901.21.00' },
        update: {},
        create: {
            id: 'tariff001',
            code: '0901.21.00',
            description: 'Coffee, roasted, not decaffeinated',
            dutyRate: 5.5,
            adValoremRate: 3.0, // 3% export duty
            exportDutyMinAmount: 10.0,
        },
    });

    await prisma.tariffPosition.upsert({
        where: { code: '2204.21.00' },
        update: {},
        create: {
            id: 'tariff002',
            code: '2204.21.00',
            description: 'Wine of fresh grapes',
            dutyRate: 10.0,
            adValoremRate: 5.0, // 5% export duty
        },
    });

    await prisma.tariffPosition.upsert({
        where: { code: '8471.30.00' },
        update: {},
        create: {
            id: 'tariff003',
            code: '8471.30.00',
            description: 'Portable automatic data processing machines',
            dutyRate: 0.0,
        },
    });

    await prisma.tariffPosition.upsert({
        where: { code: '6403.99.00' },
        update: {},
        create: {
            id: 'tariff004',
            code: '6403.99.00',
            description: 'Footwear with outer soles of rubber',
            dutyRate: 12.5,
            adValoremRate: 2.5, // 2.5% export duty
        },
    });
    console.log('✓ Tariff Positions created\n');

    // 6. Seed Providers
    console.log('🏭 Seeding Providers...');
    const providers = [
        {
            id: 'provider001',
            name: 'Acme Manufacturing SA',
            email: 'contact@acme.com.ar',
            phone: '+54 11 4567-8900',
            address: 'Av. Corrientes 1234, Buenos Aires',
            taxId: '30-12345678-9',
            organizationId: 'org001',
        },
        {
            id: 'provider002',
            name: 'Global Exports Ltd',
            email: 'info@globalexports.com',
            phone: '+54 11 5678-9012',
            address: 'Av. Santa Fe 5678, Buenos Aires',
            taxId: '30-23456789-0',
            organizationId: 'org001',
        },
        {
            id: 'provider003',
            name: 'Premium Goods SRL',
            email: 'sales@premiumgoods.com.ar',
            phone: '+54 11 6789-0123',
            address: 'Av. Libertador 9012, Buenos Aires',
            taxId: '30-34567890-1',
            organizationId: 'org001',
        },
    ];

    for (const provider of providers) {
        await prisma.provider.upsert({
            where: { id: provider.id },
            update: {},
            create: provider,
        });
    }
    console.log('✓ Providers created\n');

    // 7. Seed Clients
    console.log('🤝 Seeding Clients...');
    const clients = [
        {
            id: 'client001',
            name: 'International Traders Inc',
            email: 'orders@inttraders.com',
            phone: '+1 305 123-4567',
            address: '123 Main St, Miami, FL',
            taxId: 'US-123456789',
            status: 'CLIENT' as const,
            organizationId: 'org001',
        },
        {
            id: 'client002',
            name: 'European Imports GmbH',
            email: 'purchasing@euroimports.de',
            phone: '+49 30 1234567',
            address: 'Hauptstraße 45, Berlin',
            taxId: 'DE-987654321',
            status: 'CLIENT' as const,
            organizationId: 'org001',
        },
        {
            id: 'client003',
            name: 'Asian Distribution Co',
            email: 'contact@asiandist.cn',
            phone: '+86 10 8765-4321',
            address: '88 Nanjing Rd, Shanghai',
            taxId: 'CN-456789123',
            status: 'CLIENT' as const,
            organizationId: 'org001',
        },
    ];

    for (const client of clients) {
        await prisma.client.upsert({
            where: { id: client.id },
            update: {},
            create: client,
        });
    }
    console.log('✓ Clients created\n');

    // 8. Seed Incoterms (with proper hierarchy)
    console.log('🚢 Seeding Incoterms...');
    const exw = await prisma.incoterm.upsert({
        where: { name: 'EXW' },
        update: {},
        create: {
            id: 'incoterm001',
            name: 'EXW',
            previousIncotermId: null,
        },
    });

    const fca = await prisma.incoterm.upsert({
        where: { name: 'FCA' },
        update: {},
        create: {
            id: 'incoterm002',
            name: 'FCA',
            previousIncotermId: exw.id,
        },
    });

    const fob = await prisma.incoterm.upsert({
        where: { name: 'FOB' },
        update: {},
        create: {
            id: 'incoterm003',
            name: 'FOB',
            previousIncotermId: fca.id,
        },
    });

    const cfr = await prisma.incoterm.upsert({
        where: { name: 'CFR' },
        update: {},
        create: {
            id: 'incoterm006',
            name: 'CFR',
            previousIncotermId: fob.id,
        },
    });

    const cif = await prisma.incoterm.upsert({
        where: { name: 'CIF' },
        update: {},
        create: {
            id: 'incoterm004',
            name: 'CIF',
            previousIncotermId: cfr.id,
        },
    });

    const cpt = await prisma.incoterm.upsert({
        where: { name: 'CPT' },
        update: {},
        create: {
            id: 'incoterm007',
            name: 'CPT',
            previousIncotermId: fca.id,
        },
    });

    const cip = await prisma.incoterm.upsert({
        where: { name: 'CIP' },
        update: {},
        create: {
            id: 'incoterm008',
            name: 'CIP',
            previousIncotermId: cpt.id,
        },
    });

    const dap = await prisma.incoterm.upsert({
        where: { name: 'DAP' },
        update: {},
        create: {
            id: 'incoterm009',
            name: 'DAP',
            previousIncotermId: cpt.id,
        },
    });

    const ddp = await prisma.incoterm.upsert({
        where: { name: 'DDP' },
        update: {},
        create: {
            id: 'incoterm005',
            name: 'DDP',
            previousIncotermId: dap.id,
        },
    });

    console.log('✓ Incoterms created (9 total)\n');

    // 9. Seed Products
    console.log('📦 Seeding Products...');
    const products = [
        {
            id: 'product001',
            sku: 'PROD-001',
            title: 'Premium Arabica Coffee Beans',
            description: 'High-quality roasted coffee beans from Argentina',
            weightKg: 25.0,
            volumeM3: 0.05,
            composition: '100% Arabica Coffee',
            tariffPositionId: 'tariff001',
            unitId: 'unit001',
            providerId: 'provider001',
            organizationId: 'org001',
        },
        {
            id: 'product002',
            sku: 'PROD-002',
            title: 'Malbec Wine Reserve',
            description: 'Premium Malbec wine from Mendoza region',
            weightKg: 15.0,
            volumeM3: 0.012,
            composition: 'Malbec Grapes, Sulfites',
            tariffPositionId: 'tariff002',
            unitId: 'unit002',
            providerId: 'provider002',
            organizationId: 'org001',
        },
        {
            id: 'product003',
            sku: 'PROD-003',
            title: 'Leather Boots',
            description: 'Handcrafted leather boots',
            weightKg: 1.5,
            volumeM3: 0.008,
            composition: 'Genuine Leather, Rubber Sole',
            tariffPositionId: 'tariff004',
            unitId: 'unit003',
            providerId: 'provider003',
            organizationId: 'org001',
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        });
    }
    console.log('✓ Products created\n');

    // 10. Seed Price History
    console.log('💰 Seeding Price History...');
    const priceHistory = [
        { id: 'price001', productId: 'product001', type: 'COST' as const, value: 45.50 },
        { id: 'price002', productId: 'product001', type: 'SELLING' as const, value: 75.00 },
        { id: 'price003', productId: 'product002', type: 'COST' as const, value: 120.00 },
        { id: 'price004', productId: 'product002', type: 'SELLING' as const, value: 200.00 },
        { id: 'price005', productId: 'product003', type: 'COST' as const, value: 85.00 },
        { id: 'price006', productId: 'product003', type: 'SELLING' as const, value: 150.00 },
    ];

    for (const price of priceHistory) {
        await prisma.priceHistory.upsert({
            where: { id: price.id },
            update: {},
            create: price,
        });
    }
    console.log('✓ Price History created\n');

    // 11. Seed Costs (with new proration fields)
    console.log('💵 Seeding Costs...');
    await prisma.cost.upsert({
        where: { id: 'cost001' },
        update: {},
        create: {
            id: 'cost001',
            type: 'FIXED',
            description: 'Customs Broker Fee',
            value: 500.00,
            prorate: true,
            perUnitOrTotal: 'TOTAL',
            incotermToBeIncludedId: fob.id,
        },
    });

    await prisma.cost.upsert({
        where: { id: 'cost002' },
        update: {},
        create: {
            id: 'cost002',
            type: 'FIXED',
            description: 'Terminal Handling',
            value: 300.00,
            prorate: true,
            perUnitOrTotal: 'TOTAL',
            incotermToBeIncludedId: fob.id,
        },
    });

    await prisma.cost.upsert({
        where: { id: 'cost003' },
        update: {},
        create: {
            id: 'cost003',
            type: 'FREIGHT',
            description: 'Ocean Freight to Miami',
            value: 2500.00,
            prorate: false,
            perUnitOrTotal: 'TOTAL',
            incotermToBeIncludedId: cif.id,
        },
    });

    await prisma.cost.upsert({
        where: { id: 'cost004' },
        update: {},
        create: {
            id: 'cost004',
            type: 'INSURANCE',
            description: 'Cargo Insurance',
            value: 150.00,
            prorate: false,
            perUnitOrTotal: 'TOTAL',
            incotermToBeIncludedId: cif.id,
        },
    });
    console.log('✓ Costs created\n');

    // 12. Seed Taxes
    console.log('📊 Seeding Taxes...');
    const taxes = [
        { id: 'tax001', name: 'VAT', percentage: 21.0, productId: 'product001' },
        { id: 'tax002', name: 'Excise Tax', percentage: 5.0, productId: 'product002' },
        { id: 'tax003', name: 'VAT', percentage: 21.0, productId: 'product002' },
        { id: 'tax004', name: 'VAT', percentage: 21.0, productId: 'product003' },
    ];

    for (const tax of taxes) {
        await prisma.tax.upsert({
            where: { id: tax.id },
            update: {},
            create: tax,
        });
    }
    console.log('✓ Taxes created\n');

    // 13. Seed Export Tasks
    console.log('📋 Seeding Export Tasks...');
    const tasks = [
        {
            id: 'task001',
            description: 'Certificate of Origin - USA: Obtain certificate of origin for coffee export to USA',
            status: 'IN_PROGRESS' as const,
            countryId: 'country001',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'task002',
            description: 'Phytosanitary Certificate - Brazil: Get phytosanitary certificate for wine export',
            status: 'PENDING' as const,
            countryId: 'country002',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'task003',
            description: 'Quality Inspection - China: Schedule quality inspection for leather goods',
            status: 'COMPLETED' as const,
            countryId: 'country003',
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'task004',
            description: 'Customs Documentation - Germany: Prepare customs documentation package',
            status: 'IN_PROGRESS' as const,
            countryId: 'country004',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
    ];

    for (const task of tasks) {
        await prisma.exportTask.upsert({
            where: { id: task.id },
            update: {},
            create: task,
        });
    }

    // Link tasks with products
    await prisma.exportTask.update({
        where: { id: 'task001' },
        data: { products: { connect: [{ id: 'product001' }] } },
    });
    await prisma.exportTask.update({
        where: { id: 'task002' },
        data: { products: { connect: [{ id: 'product002' }] } },
    });
    await prisma.exportTask.update({
        where: { id: 'task003' },
        data: { products: { connect: [{ id: 'product003' }] } },
    });
    await prisma.exportTask.update({
        where: { id: 'task004' },
        data: { products: { connect: [{ id: 'product001' }, { id: 'product002' }] } },
    });
    console.log('✓ Export Tasks created\n');

    // 14. Seed Budgets
    console.log('💼 Seeding Budgets...');
    const budgets = [
        {
            id: 'budget001',
            clientId: 'client001',
            incotermId: fob.id,
            totalAmount: 15000.00,
            status: 'APPROVED' as const,
            organizationId: 'org001',
        },
        {
            id: 'budget002',
            clientId: 'client002',
            incotermId: cif.id,
            totalAmount: 25000.00,
            status: 'PENDING_APPROVAL' as const,
            organizationId: 'org001',
        },
        {
            id: 'budget003',
            clientId: 'client003',
            incotermId: fob.id,
            totalAmount: 8500.00,
            status: 'APPROVED' as const,
            organizationId: 'org001',
        },
    ];

    for (const budget of budgets) {
        await prisma.budget.upsert({
            where: { id: budget.id },
            update: {},
            create: budget,
        });
    }
    console.log('✓ Budgets created\n');

    // 15. Seed Budget Items
    console.log('📝 Seeding Budget Items...');
    const budgetItems = [
        { id: 'budgetitem001', budgetId: 'budget001', productId: 'product001', quantity: 100, unitPrice: 75.00, totalLine: 7500.00 },
        { id: 'budgetitem002', budgetId: 'budget001', productId: 'product002', quantity: 50, unitPrice: 200.00, totalLine: 10000.00 },
        { id: 'budgetitem003', budgetId: 'budget002', productId: 'product003', quantity: 150, unitPrice: 150.00, totalLine: 22500.00 },
        { id: 'budgetitem004', budgetId: 'budget003', productId: 'product001', quantity: 80, unitPrice: 75.00, totalLine: 6000.00 },
    ];

    for (const item of budgetItems) {
        await prisma.budgetItem.upsert({
            where: { id: item.id },
            update: {},
            create: item,
        });
    }
    console.log('✓ Budget Items created\n');

    // 16. Link Budgets with Costs
    console.log('🔗 Linking Budgets with Costs...');
    await prisma.budget.update({
        where: { id: 'budget001' },
        data: { costs: { connect: [{ id: 'cost001' }, { id: 'cost003' }] } },
    });
    await prisma.budget.update({
        where: { id: 'budget002' },
        data: { costs: { connect: [{ id: 'cost001' }, { id: 'cost002' }, { id: 'cost003' }, { id: 'cost004' }] } },
    });
    await prisma.budget.update({
        where: { id: 'budget003' },
        data: { costs: { connect: [{ id: 'cost001' }] } },
    });
    console.log('✓ Budget-Cost links created\n');

    // 17. Seed Invoices
    console.log('🧾 Seeding Invoices...');
    const invoices = [
        {
            id: 'invoice001',
            invoiceNumber: 'INV-2024-001',
            budgetId: 'budget001',
            totalAmount: 15000.00,
            issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'invoice002',
            invoiceNumber: 'INV-2024-002',
            budgetId: 'budget003',
            totalAmount: 8500.00,
            issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        },
    ];

    for (const invoice of invoices) {
        await prisma.invoice.upsert({
            where: { invoiceNumber: invoice.invoiceNumber },
            update: {},
            create: invoice,
        });
    }
    console.log('✓ Invoices created\n');

    // 18. Seed Packing Lists
    console.log('📦 Seeding Packing Lists...');
    await prisma.packingList.upsert({
        where: { id: 'packing001' },
        update: {},
        create: {
            id: 'packing001',
            budgetId: 'budget001',
            details: {
                items: [
                    { productId: 'product001', productName: 'Premium Arabica Coffee Beans', quantity: 100, weight: 2500, volume: 5 },
                    { productId: 'product002', productName: 'Malbec Wine Reserve', quantity: 50, weight: 750, volume: 0.6 },
                ],
                totalWeight: 3250,
                totalVolume: 5.6,
            },
        },
    });

    await prisma.packingList.upsert({
        where: { id: 'packing002' },
        update: {},
        create: {
            id: 'packing002',
            budgetId: 'budget003',
            details: {
                items: [
                    { productId: 'product001', productName: 'Premium Arabica Coffee Beans', quantity: 80, weight: 2000, volume: 4 },
                ],
                totalWeight: 2000,
                totalVolume: 4,
            },
        },
    });
    console.log('✓ Packing Lists created\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  - 1 Organization');
    console.log('  - 5 Users (password: Admin123!)');
    console.log('  - 5 Countries');
    console.log('  - 5 Units of Measure');
    console.log('  - 4 Tariff Positions');
    console.log('  - 3 Providers');
    console.log('  - 3 Clients');
    console.log('  - 9 Incoterms (EXW → FCA → FOB → CFR → CIF, CPT → CIP/DAP → DDP)');
    console.log('  - 3 Products');
    console.log('  - 6 Price History entries');
    console.log('  - 4 Costs');
    console.log('  - 4 Taxes');
    console.log('  - 4 Export Tasks');
    console.log('  - 3 Budgets');
    console.log('  - 4 Budget Items');
    console.log('  - 2 Invoices');
    console.log('  - 2 Packing Lists\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
