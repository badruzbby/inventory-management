import React, { useState, useEffect } from 'react';
import {
  CubeIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { productsApi, transactionsApi, suppliersApi, reportsApi } from '../../utils/api';
import type { Product, Transaction, StockReport } from '../../types';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  lowStockProducts: number;
  recentTransactions: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSuppliers: 0,
    lowStockProducts: 0,
    recentTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stockReport, setStockReport] = useState<StockReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        productsResponse,
        suppliersResponse,
        lowStockResponse,
        transactionsResponse,
        stockReportResponse,
      ] = await Promise.all([
        productsApi.getActive(),
        suppliersApi.getActive(),
        productsApi.getLowStock(),
        transactionsApi.getByDateRange(
          format(subDays(new Date(), 7), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd')
        ),
        reportsApi.getStockReport(),
      ]);

      setStats({
        totalProducts: productsResponse.data.length,
        totalSuppliers: suppliersResponse.data.length,
        lowStockProducts: lowStockResponse.data.length,
        recentTransactions: transactionsResponse.data.length,
      });

      setRecentTransactions(transactionsResponse.data.slice(0, 5));
      setLowStockProducts(lowStockResponse.data.slice(0, 5));
      setStockReport(stockReportResponse.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Suppliers',
      value: stats.totalSuppliers,
      icon: TruckIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Recent Transactions',
      value: stats.recentTransactions,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentTransactions.map((transaction, index) => (
                  <li key={transaction.id}>
                    <div className="relative pb-8">
                      {index !== recentTransactions.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              transaction.type === 'IN'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          >
                            {transaction.type === 'IN' ? (
                              <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {transaction.productName} - {transaction.quantity} units
                            </p>
                            <p className="text-sm text-gray-500">
                              by {transaction.username}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Low Stock Alerts
            </h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No low stock products</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {product.stock} / Min: {product.minimumStock}
                      </p>
                    </div>
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Value Overview */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Stock Value Overview
          </h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Product</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Value</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockReport.map((item) => (
                  <tr key={item.productId}>
                    <td className="table-cell font-medium">
                      {item.productName}
                    </td>
                    <td className="table-cell text-gray-500">
                      {item.category || 'N/A'}
                    </td>
                    <td className="table-cell">
                      {item.currentStock}
                    </td>
                    <td className="table-cell">
                      ${item.stockValue.toFixed(2)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.lowStock
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.lowStock ? 'Low Stock' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
