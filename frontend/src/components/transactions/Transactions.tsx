import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import { transactionsApi, productsApi, suppliersApi } from '../../utils/api';
import type { Transaction, Product, Supplier, CreateTransactionRequest } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionRequest>();

  const transactionType = watch('type');
  const selectedProductId = watch('productId');

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchTransactionsByDateRange();
    }
  }, [dateRange]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionsApi.getAll();
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsByDateRange = async () => {
    try {
      const response = await transactionsApi.getByDateRange(dateRange.start, dateRange.end);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions by date range');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getActive();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersApi.getActive();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers');
    }
  };

  const onSubmit = async (data: CreateTransactionRequest) => {
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const transactionData = {
        ...data,
        userId: user.id,
        productId: Number(data.productId),
        quantity: Number(data.quantity),
        unitPrice: data.unitPrice ? Number(data.unitPrice) : undefined,
        supplierId: data.supplierId ? Number(data.supplierId) : undefined,
      };

      await transactionsApi.create(transactionData);
      toast.success('Transaction created successfully');
      fetchTransactions();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsApi.delete(id);
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'ALL') return true;
    return transaction.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage inventory transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="form-label">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ALL' | 'IN' | 'OUT')}
            className="form-input"
          >
            <option value="ALL">All Transactions</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="form-input"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <table className="table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Type</th>
              <th className="table-header">Product</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Unit Price</th>
              <th className="table-header">Total</th>
              <th className="table-header">Supplier</th>
              <th className="table-header">User</th>
              <th className="table-header">Reference</th>
              {isAdmin() && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="table-cell">
                  {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="table-cell">
                  <div className="flex items-center">
                    {transaction.type === 'IN' ? (
                      <>
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">IN</span>
                      </>
                    ) : (
                      <>
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600 font-medium">OUT</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="table-cell font-medium">{transaction.productName}</td>
                <td className="table-cell">{transaction.quantity}</td>
                <td className="table-cell">${transaction.unitPrice.toFixed(2)}</td>
                <td className="table-cell font-medium">${transaction.totalPrice.toFixed(2)}</td>
                <td className="table-cell">{transaction.supplierName || 'N/A'}</td>
                <td className="table-cell">{transaction.username}</td>
                <td className="table-cell">{transaction.referenceNumber || 'N/A'}</td>
                {isAdmin() && (
                  <td className="table-cell">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Transaction
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Transaction Type</label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="form-input"
                  >
                    <option value="">Select type</option>
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                  </select>
                  {errors.type && <p className="text-red-600 text-sm">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="form-label">Product</label>
                  <select
                    {...register('productId', { required: 'Product is required' })}
                    className="form-input"
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                  {errors.productId && <p className="text-red-600 text-sm">{errors.productId.message}</p>}
                  {selectedProduct && transactionType === 'OUT' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Available stock: {selectedProduct.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label">Quantity</label>
                  <input
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    type="number"
                    className="form-input"
                  />
                  {errors.quantity && <p className="text-red-600 text-sm">{errors.quantity.message}</p>}
                </div>

                <div>
                  <label className="form-label">Unit Price (optional)</label>
                  <input
                    {...register('unitPrice')}
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder={selectedProduct ? `Default: $${selectedProduct.priceIn}` : ''}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to use product default price
                  </p>
                </div>

                {transactionType === 'IN' && (
                  <div>
                    <label className="form-label">Supplier</label>
                    <select {...register('supplierId')} className="form-input">
                      <option value="">Select supplier (optional)</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="form-label">Reference Number</label>
                  <input {...register('referenceNumber')} className="form-input" />
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <textarea {...register('notes')} className="form-input" rows={3} />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
