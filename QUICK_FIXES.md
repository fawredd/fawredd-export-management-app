# QUICK FIXES

## Fix 1: budget.repository.ts (Line 5-6)

**Problem**: Decimal imported twice

**Change line 5-6 from:**
```typescript
import { PrismaClient, BudgetStatus, Decimal } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
```

**To:**
```typescript
import { PrismaClient, BudgetStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
```

## Fix 2: budget.service.ts (Line 17-53)

**Problem**: Missing calculation logic (variables `calculation` and `budgetItems` are undefined)

**Replace the entire createBudget method (lines 17-53) with:**

```typescript
async createBudget(data: {
  clientId: string;
  incoterm: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  costIds?: string[];
}) {
  // Find the incoterm by name to get its ID
  const incoterm = await prisma.incoterm.findUnique({
    where: { name: data.incoterm },
  });

  if (!incoterm) {
    throw new AppError(400, `Invalid incoterm: ${data.incoterm}`);
  }

  // Get user's organization
  const user = await prisma.user.findFirst();
  const organizationId = user?.organizationId || null;

  // Fetch products to get weight and volume
  const products = await Promise.all(
    data.items.map((item) => productRepository.findById(item.productId)),
  );

  // Validate all products exist
  if (products.some((p) => !p)) {
    throw new AppError(404, 'One or more products not found');
  }

  // Fetch costs if provided
  let costs: any[] = [];
  if (data.costIds && data.costIds.length > 0) {
    costs = await prisma.cost.findMany({
      where: { id: { in: data.costIds } },
    });
  }

  // Prepare items with weight and volume
  const itemsWithDetails = data.items.map((item, index) => ({
    ...item,
    weightKg: products[index]?.weightKg || 0,
    volumeM3: products[index]?.volumeM3 || 0,
  }));

  // Prepare costs for calculation
  const costsForCalculation = costs.map((cost) => ({
    id: cost.id,
    name: cost.description || 'Cost',
    type: cost.type,
    value: Number(cost.value),
  }));

  // Calculate budget
  const calculation = calculateBudget(
    itemsWithDetails,
    costsForCalculation,
    data.incoterm as any,
    0,
  );

  // Create budget items
  const budgetItems = calculation.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: toPrismaDecimal(item.unitPrice),
    proratedCosts: toPrismaDecimal(item.proratedCosts),
    duties: toPrismaDecimal(item.duties),
    freight: toPrismaDecimal(item.freight),
    insurance: toPrismaDecimal(item.insurance),
    totalLine: toPrismaDecimal(item.totalLine),
  }));

  // Create budget
  const budget = await budgetRepository.create({
    clientId: data.clientId,
    incotermId: incoterm.id,
    organizationId,
    totalAmount: toPrismaDecimal(calculation.totalAmount),
    budgetItems,
    costs: data.costIds,
  });

  return budget;
}
```

After applying these fixes, restart the backend:
```bash
docker-compose restart backend
```
