-- Seed data for initial database setup
-- This file is automatically executed when the postgres container starts

-- Note: User passwords should be hashed with bcrypt in the actual application
-- The password below is a placeholder and should be replaced with a properly hashed password

-- Insert admin user (password: Admin123! - should be hashed in production)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES 
  ('admin001', 'admin@example.com', '$2a$10$L.M3ueHTu.CQdzmUsIKKr.wzF5RjoyO04dF0LYKGM50q8nFGUgaHy', 'System Administrator', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample countries
INSERT INTO "Country" (id, name, code, "createdAt", "updatedAt")
VALUES 
  ('country001', 'United States', 'US', NOW(), NOW()),
  ('country002', 'Brazil', 'BR', NOW(), NOW()),
  ('country003', 'China', 'CN', NOW(), NOW()),
  ('country004', 'Germany', 'DE', NOW(), NOW()),
  ('country005', 'Chile', 'CL', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert sample units of measure
INSERT INTO "UnitOfMeasure" (id, name, abbreviation, "createdAt", "updatedAt")
VALUES 
  ('unit001', 'Kilogram', 'kg', NOW(), NOW()),
  ('unit002', 'Liter', 'L', NOW(), NOW()),
  ('unit003', 'Unit', 'un', NOW(), NOW()),
  ('unit004', 'Ton', 't', NOW(), NOW()),
  ('unit005', 'Box', 'box', NOW(), NOW())
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert sample tariff positions
INSERT INTO "TariffPosition" (id, code, description, "dutyRate", "createdAt", "updatedAt")
VALUES 
  ('tariff001', '0901.21.00', 'Coffee, roasted, not decaffeinated', 5.5, NOW(), NOW()),
  ('tariff002', '2204.21.00', 'Wine of fresh grapes', 10.0, NOW(), NOW()),
  ('tariff003', '8471.30.00', 'Portable automatic data processing machines', 0.0, NOW(), NOW()),
  ('tariff004', '6403.99.00', 'Footwear with outer soles of rubber', 12.5, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert sample providers
INSERT INTO "Provider" (id, name, email, phone, address, "taxId", "createdAt", "updatedAt")
VALUES 
  ('provider001', 'Acme Manufacturing SA', 'contact@acme.com.ar', '+54 11 4567-8900', 'Av. Corrientes 1234, Buenos Aires', '30-12345678-9', NOW(), NOW()),
  ('provider002', 'Global Exports Ltd', 'info@globalexports.com', '+54 11 5678-9012', 'Av. Santa Fe 5678, Buenos Aires', '30-23456789-0', NOW(), NOW()),
  ('provider003', 'Premium Goods SRL', 'sales@premiumgoods.com.ar', '+54 11 6789-0123', 'Av. Libertador 9012, Buenos Aires', '30-34567890-1', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample clients
INSERT INTO "Client" (id, name, email, phone, address, "taxId", "createdAt", "updatedAt")
VALUES 
  ('client001', 'International Traders Inc', 'orders@inttraders.com', '+1 305 123-4567', '123 Main St, Miami, FL', 'US-123456789', NOW(), NOW()),
  ('client002', 'European Imports GmbH', 'purchasing@euroimports.de', '+49 30 1234567', 'Hauptstraße 45, Berlin', 'DE-987654321', NOW(), NOW()),
  ('client003', 'Asian Distribution Co', 'contact@asiandist.cn', '+86 10 8765-4321', '88 Nanjing Rd, Shanghai', 'CN-456789123', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO "Product" (id, sku, title, description, "weightKg", "volumeM3", composition, "tariffPositionId", "unitId", "providerId", "createdAt", "updatedAt")
VALUES 
  ('product001', 'PROD-001', 'Premium Arabica Coffee Beans', 'High-quality roasted coffee beans from Argentina', 25.0, 0.05, '100% Arabica Coffee', 'tariff001', 'unit001', 'provider001', NOW(), NOW()),
  ('product002', 'PROD-002', 'Malbec Wine Reserve', 'Premium Malbec wine from Mendoza region', 15.0, 0.012, 'Malbec Grapes, Sulfites', 'tariff002', 'unit002', 'provider002', NOW(), NOW()),
  ('product003', 'PROD-003', 'Leather Boots', 'Handcrafted leather boots', 1.5, 0.008, 'Genuine Leather, Rubber Sole', 'tariff004', 'unit003', 'provider003', NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- Insert sample price history
INSERT INTO "PriceHistory" (id, "productId", type, value, date, "createdAt")
VALUES 
  ('price001', 'product001', 'COST', 45.50, NOW(), NOW()),
  ('price002', 'product001', 'SELLING', 75.00, NOW(), NOW()),
  ('price003', 'product002', 'COST', 120.00, NOW(), NOW()),
  ('price004', 'product002', 'SELLING', 200.00, NOW(), NOW()),
  ('price005', 'product003', 'COST', 85.00, NOW(), NOW()),
  ('price006', 'product003', 'SELLING', 150.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample costs
INSERT INTO "Cost" (id, type, description, value, "createdAt", "updatedAt")
VALUES 
  ('cost001', 'FIXED', 'Customs Broker Fee', 500.00, NOW(), NOW()),
  ('cost002', 'FIXED', 'Terminal Handling', 300.00, NOW(), NOW()),
  ('cost003', 'FREIGHT', 'Ocean Freight to Miami', 2500.00, NOW(), NOW()),
  ('cost004', 'INSURANCE', 'Cargo Insurance', 150.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert additional users with different roles
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES 
  ('trader001', 'trader@example.com', '$2a$10$L.M3ueHTu.CQdzmUsIKKr.wzF5RjoyO04dF0LYKGM50q8nFGUgaHy', 'John Trader', 'TRADER', NOW(), NOW()),
  ('manufacturer001', 'manufacturer@example.com', '$2a$10$L.M3ueHTu.CQdzmUsIKKr.wzF5RjoyO04dF0LYKGM50q8nFGUgaHy', 'Maria Manufacturer', 'MANUFACTURER', NOW(), NOW()),
  ('client001user', 'client@example.com', '$2a$10$L.M3ueHTu.CQdzmUsIKKr.wzF5RjoyO04dF0LYKGM50q8nFGUgaHy', 'Client User', 'CLIENT', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample taxes for products
INSERT INTO "Tax" (id, name, percentage, "productId", "createdAt", "updatedAt")
VALUES 
  ('tax001', 'VAT', 21.0, 'product001', NOW(), NOW()),
  ('tax002', 'Excise Tax', 5.0, 'product002', NOW(), NOW()),
  ('tax003', 'VAT', 21.0, 'product002', NOW(), NOW()),
  ('tax004', 'VAT', 21.0, 'product003', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample export tasks
INSERT INTO "ExportTask" (id, description, status, "dueDate", "completedAt", "countryId", "createdAt", "updatedAt")
VALUES 
  ('task001', 'Certificate of Origin - USA: Obtain certificate of origin for coffee export to USA', 'IN_PROGRESS', NOW() + INTERVAL '7 days', NULL, 'country001', NOW(), NOW()),
  ('task002', 'Phytosanitary Certificate - Brazil: Get phytosanitary certificate for wine export', 'PENDING', NOW() + INTERVAL '14 days', NULL, 'country002', NOW(), NOW()),
  ('task003', 'Quality Inspection - China: Schedule quality inspection for leather goods', 'COMPLETED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', 'country003', NOW(), NOW()),
  ('task004', 'Customs Documentation - Germany: Prepare customs documentation package', 'IN_PROGRESS', NOW() + INTERVAL '10 days', NULL, 'country004', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Link export tasks with products (many-to-many)
INSERT INTO "_ExportTaskToProduct" ("A", "B")
VALUES 
  ('task001', 'product001'),
  ('task002', 'product002'),
  ('task003', 'product003'),
  ('task004', 'product001'),
  ('task004', 'product002')
ON CONFLICT DO NOTHING;

-- Insert sample budgets
INSERT INTO "Budget" (id, "clientId", incoterm, "totalAmount", status, "createdAt", "updatedAt")
VALUES 
  ('budget001', 'client001', 'FOB', 15000.00, 'APPROVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
  ('budget002', 'client002', 'CIF', 25000.00, 'PENDING_APPROVAL', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('budget003', 'client003', 'FOB', 8500.00, 'APPROVED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Insert budget items
INSERT INTO "BudgetItem" (id, "budgetId", "productId", quantity, "unitPrice", "totalLine", "createdAt", "updatedAt")
VALUES 
  ('budgetitem001', 'budget001', 'product001', 100, 75.00, 7500.00, NOW(), NOW()),
  ('budgetitem002', 'budget001', 'product002', 50, 200.00, 10000.00, NOW(), NOW()),
  ('budgetitem003', 'budget002', 'product003', 150, 150.00, 22500.00, NOW(), NOW()),
  ('budgetitem004', 'budget003', 'product001', 80, 75.00, 6000.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Link budgets with costs (many-to-many)
INSERT INTO "_BudgetToCost" ("A", "B")
VALUES 
  ('budget001', 'cost001'),
  ('budget001', 'cost003'),
  ('budget002', 'cost001'),
  ('budget002', 'cost002'),
  ('budget002', 'cost003'),
  ('budget002', 'cost004'),
  ('budget003', 'cost001')
ON CONFLICT DO NOTHING;

-- Insert sample invoices
INSERT INTO "Invoice" (id, "invoiceNumber", "budgetId", "totalAmount", "issueDate", "dueDate", "pdfUrl", "createdAt", "updatedAt")
VALUES 
  ('invoice001', 'INV-2024-001', 'budget001', 15000.00, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NULL, NOW(), NOW()),
  ('invoice002', 'INV-2024-002', 'budget003', 8500.00, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NULL, NOW(), NOW())
ON CONFLICT ("invoiceNumber") DO NOTHING;

-- Insert sample packing lists
INSERT INTO "PackingList" (id, "budgetId", details, "pdfUrl", "createdAt", "updatedAt")
VALUES 
  ('packing001', 'budget001', 
   '{"items": [{"productId": "product001", "productName": "Premium Arabica Coffee Beans", "quantity": 100, "weight": 2500, "volume": 5}, {"productId": "product002", "productName": "Malbec Wine Reserve", "quantity": 50, "weight": 750, "volume": 0.6}], "totalWeight": 3250, "totalVolume": 5.6}'::jsonb, 
   NULL, NOW(), NOW()),
  ('packing002', 'budget003', 
   '{"items": [{"productId": "product001", "productName": "Premium Arabica Coffee Beans", "quantity": 80, "weight": 2000, "volume": 4}], "totalWeight": 2000, "totalVolume": 4}'::jsonb, 
   NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;