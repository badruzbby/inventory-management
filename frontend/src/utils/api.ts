import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { 
  User, 
  Supplier, 
  Product, 
  Transaction, 
  StockReport, 
  TransactionSummary,
  LoginRequest, 
  LoginResponse,
  CreateUserRequest,
  CreateSupplierRequest,
  CreateProductRequest,
  CreateTransactionRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/signin', credentials),
  
  register: (userData: CreateUserRequest): Promise<AxiosResponse<User>> =>
    api.post('/auth/signup', userData),
  
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),
  
  getActive: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users/active'),
  
  getById: (id: number): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
  
  getByRole: (role: string): Promise<AxiosResponse<User[]>> =>
    api.get(`/users/role/${role}`),
  
  create: (userData: CreateUserRequest): Promise<AxiosResponse<User>> =>
    api.post('/users', userData),
  
  update: (id: number, userData: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put(`/users/${id}`, userData),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/users/${id}`),
};

// Suppliers API
export const suppliersApi = {
  getAll: (): Promise<AxiosResponse<Supplier[]>> =>
    api.get('/suppliers'),
  
  getActive: (): Promise<AxiosResponse<Supplier[]>> =>
    api.get('/suppliers/active'),
  
  getById: (id: number): Promise<AxiosResponse<Supplier>> =>
    api.get(`/suppliers/${id}`),
  
  search: (keyword: string): Promise<AxiosResponse<Supplier[]>> =>
    api.get(`/suppliers/search?keyword=${keyword}`),
  
  create: (supplierData: CreateSupplierRequest): Promise<AxiosResponse<Supplier>> =>
    api.post('/suppliers', supplierData),
  
  update: (id: number, supplierData: Partial<Supplier>): Promise<AxiosResponse<Supplier>> =>
    api.put(`/suppliers/${id}`, supplierData),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/suppliers/${id}`),
};

// Products API
export const productsApi = {
  getAll: (): Promise<AxiosResponse<Product[]>> =>
    api.get('/products'),
  
  getActive: (): Promise<AxiosResponse<Product[]>> =>
    api.get('/products/active'),
  
  getById: (id: number): Promise<AxiosResponse<Product>> =>
    api.get(`/products/${id}`),
  
  getByCategory: (category: string): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/category/${category}`),
  
  getBySupplier: (supplierId: number): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/supplier/${supplierId}`),
  
  search: (keyword: string): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/search?keyword=${keyword}`),
  
  getLowStock: (): Promise<AxiosResponse<Product[]>> =>
    api.get('/products/low-stock'),
  
  getCategories: (): Promise<AxiosResponse<string[]>> =>
    api.get('/products/categories'),
  
  create: (productData: CreateProductRequest): Promise<AxiosResponse<Product>> =>
    api.post('/products', productData),
  
  update: (id: number, productData: Partial<Product>): Promise<AxiosResponse<Product>> =>
    api.put(`/products/${id}`, productData),
  
  updateStock: (id: number, stock: number): Promise<AxiosResponse<void>> =>
    api.patch(`/products/${id}/stock?stock=${stock}`),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/products/${id}`),
};

// Transactions API
export const transactionsApi = {
  getAll: (): Promise<AxiosResponse<Transaction[]>> =>
    api.get('/transactions'),
  
  getById: (id: number): Promise<AxiosResponse<Transaction>> =>
    api.get(`/transactions/${id}`),
  
  getByProduct: (productId: number): Promise<AxiosResponse<Transaction[]>> =>
    api.get(`/transactions/product/${productId}`),
  
  getByUser: (userId: number): Promise<AxiosResponse<Transaction[]>> =>
    api.get(`/transactions/user/${userId}`),
  
  getByType: (type: 'IN' | 'OUT'): Promise<AxiosResponse<Transaction[]>> =>
    api.get(`/transactions/type/${type}`),
  
  getByDateRange: (startDate: string, endDate: string): Promise<AxiosResponse<Transaction[]>> =>
    api.get(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  create: (transactionData: CreateTransactionRequest): Promise<AxiosResponse<Transaction>> =>
    api.post('/transactions', transactionData),
  
  update: (id: number, transactionData: Partial<Transaction>): Promise<AxiosResponse<Transaction>> =>
    api.put(`/transactions/${id}`, transactionData),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/transactions/${id}`),
};

// Reports API
export const reportsApi = {
  getStockReport: (): Promise<AxiosResponse<StockReport[]>> =>
    api.get('/reports/stock'),
  
  getTransactionSummary: (startDate: string, endDate: string): Promise<AxiosResponse<TransactionSummary[]>> =>
    api.get(`/reports/summary?startDate=${startDate}&endDate=${endDate}`),
};

export default api;
