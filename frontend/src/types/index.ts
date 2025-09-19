export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: 'ADMIN' | 'STAFF';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  category?: string;
  sku?: string;
  description?: string;
  priceIn: number;
  priceOut: number;
  stock: number;
  minimumStock: number;
  supplierId?: number;
  supplierName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  productId: number;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: number;
  supplierName?: string;
  userId: number;
  username: string;
  notes?: string;
  referenceNumber?: string;
  transactionDate: string;
}

export interface StockReport {
  productId: number;
  productName: string;
  category?: string;
  sku?: string;
  currentStock: number;
  minimumStock: number;
  priceIn: number;
  priceOut: number;
  supplierName?: string;
  lowStock: boolean;
  stockValue: number;
}

export interface TransactionSummary {
  date: string;
  period: string;
  totalTransactions: number;
  inTransactions: number;
  outTransactions: number;
  totalInValue: number;
  totalOutValue: number;
  netValue: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: 'ADMIN' | 'STAFF';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  role: 'ADMIN' | 'STAFF';
}

export interface CreateSupplierRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface CreateProductRequest {
  name: string;
  category?: string;
  sku?: string;
  description?: string;
  priceIn: number;
  priceOut: number;
  minimumStock: number;
  supplierId?: number;
}

export interface CreateTransactionRequest {
  productId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  unitPrice?: number;
  supplierId?: number;
  userId: number;
  notes?: string;
  referenceNumber?: string;
}
