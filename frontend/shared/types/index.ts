/**
 * Shared TypeScript types for frontend and backend
 */

export enum Role {
  ADMIN = 'ADMIN',
  TRADER = 'TRADER',
  MANUFACTURER = 'MANUFACTURER',
  CLIENT = 'CLIENT',
}

export enum Incoterm {
  EXW = 'EXW',
  FCA = 'FCA',
  FOB = 'FOB',
  CFR = 'CFR',
  CIF = 'CIF',
  CPT = 'CPT',
  CIP = 'CIP',
  DAP = 'DAP',
  DPU = 'DPU',
  DDP = 'DDP',
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  INVOICED = 'INVOICED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CostType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  FREIGHT = 'FREIGHT',
  INSURANCE = 'INSURANCE',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  value: number;
  type: 'COST' | 'SELLING';
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description?: string;
  weightKg?: number;
  volumeM3?: number;
  composition?: string;
  tariffPositionId?: string;
  unitId?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  priceHistory?: PriceHistory[];
}

export interface Provider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  proratedCosts: number;
  duties: number;
  freight: number;
  insurance: number;
  totalLine: number;
}

export interface Cost {
  id: string;
  type: CostType;
  name?: string;
  description?: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  clientId: string;
  client?: Client;
  incoterm: Incoterm;
  status: BudgetStatus;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  budgetItems?: BudgetItem[];
  costs?: Cost[];
  items?: BudgetItem[];
}