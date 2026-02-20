-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "fawredd-foreign-budgets";

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."Role" AS ENUM ('ADMIN', 'TRADER', 'MANUFACTURER', 'CLIENT');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."ClientStatus" AS ENUM ('PROSPECT', 'CLIENT');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."PriceType" AS ENUM ('COST', 'SELLING');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."CostScope" AS ENUM ('PER_UNIT', 'TOTAL');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."CostType" AS ENUM ('FIXED', 'VARIABLE', 'FREIGHT', 'INSURANCE');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."BudgetStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'INVOICED');

-- CreateEnum
CREATE TYPE "fawredd-foreign-budgets"."RoundingMode" AS ENUM ('HALF_UP', 'DOWN', 'UP');

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "fawredd-foreign-budgets"."Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "fawredd-foreign-budgets"."Role" NOT NULL DEFAULT 'CLIENT',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "status" "fawredd-foreign-budgets"."ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "convertedFrom" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrls" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "weightKg" DOUBLE PRECISION,
    "volumeM3" DOUBLE PRECISION,
    "composition" TEXT,
    "tariffPositionId" TEXT,
    "unitId" TEXT,
    "providerId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."TariffPosition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dutyRate" DECIMAL(8,4),
    "adValoremRate" DECIMAL(8,4),
    "fixedExportDuty" DECIMAL(20,6),
    "exportDutyMinAmount" DECIMAL(20,6),
    "exportDutyMaxAmount" DECIMAL(20,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TariffPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."PriceHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "fawredd-foreign-budgets"."PriceType" NOT NULL,
    "value" DECIMAL(20,6) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Tax" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(8,4) NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."ExportTask" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "fawredd-foreign-budgets"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "countryId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Cost" (
    "id" TEXT NOT NULL,
    "type" "fawredd-foreign-budgets"."CostType" NOT NULL,
    "description" TEXT,
    "value" DECIMAL(20,6) NOT NULL,
    "prorate" BOOLEAN NOT NULL DEFAULT false,
    "perUnitOrTotal" "fawredd-foreign-budgets"."CostScope" NOT NULL DEFAULT 'TOTAL',
    "incotermToBeIncludedId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Budget" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "organizationId" TEXT,
    "incotermId" TEXT NOT NULL,
    "status" "fawredd-foreign-budgets"."BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(20,6),
    "shareToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Incoterm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "previousIncotermId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incoterm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."BudgetItem" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(20,6) NOT NULL,
    "proratedCosts" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "duties" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "freight" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "insurance" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "totalLine" DECIMAL(20,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."PricingConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "adjustForVAT" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" DECIMAL(8,4),
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "roundingMode" "fawredd-foreign-budgets"."RoundingMode" NOT NULL DEFAULT 'HALF_UP',
    "precision" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "totalAmount" DECIMAL(20,6) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."PackingList" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."_ExportTaskToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "fawredd-foreign-budgets"."_BudgetToCost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "fawredd-foreign-budgets"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "fawredd-foreign-budgets"."Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "TariffPosition_code_key" ON "fawredd-foreign-budgets"."TariffPosition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_abbreviation_key" ON "fawredd-foreign-budgets"."UnitOfMeasure"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "fawredd-foreign-budgets"."Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_shareToken_key" ON "fawredd-foreign-budgets"."Budget"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Incoterm_name_key" ON "fawredd-foreign-budgets"."Incoterm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PricingConfiguration_organizationId_key" ON "fawredd-foreign-budgets"."PricingConfiguration"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "fawredd-foreign-budgets"."Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "_ExportTaskToProduct_AB_unique" ON "fawredd-foreign-budgets"."_ExportTaskToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ExportTaskToProduct_B_index" ON "fawredd-foreign-budgets"."_ExportTaskToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BudgetToCost_AB_unique" ON "fawredd-foreign-budgets"."_BudgetToCost"("A", "B");

-- CreateIndex
CREATE INDEX "_BudgetToCost_B_index" ON "fawredd-foreign-budgets"."_BudgetToCost"("B");

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Provider" ADD CONSTRAINT "Provider_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Product" ADD CONSTRAINT "Product_tariffPositionId_fkey" FOREIGN KEY ("tariffPositionId") REFERENCES "fawredd-foreign-budgets"."TariffPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "fawredd-foreign-budgets"."UnitOfMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Product" ADD CONSTRAINT "Product_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "fawredd-foreign-budgets"."Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."PriceHistory" ADD CONSTRAINT "PriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "fawredd-foreign-budgets"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Tax" ADD CONSTRAINT "Tax_productId_fkey" FOREIGN KEY ("productId") REFERENCES "fawredd-foreign-budgets"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Tax" ADD CONSTRAINT "Tax_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."ExportTask" ADD CONSTRAINT "ExportTask_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "fawredd-foreign-budgets"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."ExportTask" ADD CONSTRAINT "ExportTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Cost" ADD CONSTRAINT "Cost_incotermToBeIncludedId_fkey" FOREIGN KEY ("incotermToBeIncludedId") REFERENCES "fawredd-foreign-budgets"."Incoterm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Cost" ADD CONSTRAINT "Cost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Budget" ADD CONSTRAINT "Budget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "fawredd-foreign-budgets"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Budget" ADD CONSTRAINT "Budget_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Budget" ADD CONSTRAINT "Budget_incotermId_fkey" FOREIGN KEY ("incotermId") REFERENCES "fawredd-foreign-budgets"."Incoterm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Incoterm" ADD CONSTRAINT "Incoterm_previousIncotermId_fkey" FOREIGN KEY ("previousIncotermId") REFERENCES "fawredd-foreign-budgets"."Incoterm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "fawredd-foreign-budgets"."Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."BudgetItem" ADD CONSTRAINT "BudgetItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "fawredd-foreign-budgets"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."PricingConfiguration" ADD CONSTRAINT "PricingConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Invoice" ADD CONSTRAINT "Invoice_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "fawredd-foreign-budgets"."Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."PackingList" ADD CONSTRAINT "PackingList_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "fawredd-foreign-budgets"."Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."PackingList" ADD CONSTRAINT "PackingList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "fawredd-foreign-budgets"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "fawredd-foreign-budgets"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."_ExportTaskToProduct" ADD CONSTRAINT "_ExportTaskToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "fawredd-foreign-budgets"."ExportTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."_ExportTaskToProduct" ADD CONSTRAINT "_ExportTaskToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "fawredd-foreign-budgets"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."_BudgetToCost" ADD CONSTRAINT "_BudgetToCost_A_fkey" FOREIGN KEY ("A") REFERENCES "fawredd-foreign-budgets"."Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fawredd-foreign-budgets"."_BudgetToCost" ADD CONSTRAINT "_BudgetToCost_B_fkey" FOREIGN KEY ("B") REFERENCES "fawredd-foreign-budgets"."Cost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
