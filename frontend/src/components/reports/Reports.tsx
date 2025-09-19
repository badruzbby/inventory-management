import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { reportsApi } from '../../utils/api';
import type { StockReport, TransactionSummary } from '../../types';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const Reports: React.FC = () => {
  const [stockReport, setStockReport] = useState<StockReport[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchTransactionSummary();
    }
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      await Promise.all([
        fetchStockReport(),
        fetchTransactionSummary()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    try {
      const response = await reportsApi.getStockReport();
      setStockReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch stock report');
    }
  };

  const fetchTransactionSummary = async () => {
    try {
      const response = await reportsApi.getTransactionSummary(dateRange.start, dateRange.end);
      setTransactionSummary(response.data);
    } catch (error) {
      toast.error('Failed to fetch transaction summary');
    }
  };

  // Calculate summary statistics
  const totalStockValue = stockReport.reduce((sum, item) => sum + item.stockValue, 0);
  const lowStockItems = stockReport.filter(item => item.lowStock);
  const totalProducts = stockReport.length;
  const totalTransactionValue = transactionSummary.reduce((sum, item) => sum + item.totalInValue + item.totalOutValue, 0);

  // Prepare chart data
  const stockValueData = stockReport
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10)
    .map(item => ({
      name: item.productName,
      value: item.stockValue,
      stock: item.currentStock
    }));

  const lowStockData = lowStockItems.map(item => ({
    name: item.productName,
    current: item.currentStock,
    minimum: item.minimumStock
  }));

  const transactionTrendData = transactionSummary.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    inValue: item.totalInValue,
    outValue: item.totalOutValue,
    netValue: item.netValue
  }));

  const categoryData = stockReport.reduce((acc: any[], item) => {
    const category = item.category || 'Uncategorized';
    const existing = acc.find(c => c.name === category);
    if (existing) {
      existing.value += item.stockValue;
      existing.count += 1;
    } else {
      acc.push({ name: category, value: item.stockValue, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View inventory reports and analytics</p>
        </div>
        <button className="btn-outline">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-500 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Products
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {totalProducts}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-500 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Stock Value
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${totalStockValue.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-red-500 p-3 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Low Stock Items
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {lowStockItems.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-500 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Transaction Value
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${totalTransactionValue.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stock')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stock'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Reports
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transaction Reports
          </button>
        </nav>
      </div>

      {/* Stock Reports Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Stock Value Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Products by Stock Value
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stockValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Stock Value']} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Stock Value by Category
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Low Stock Alert
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {lowStockItems.length === 0 ? (
                  <p className="text-gray-500">No low stock items</p>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          Current: {item.currentStock} | Minimum: {item.minimumStock}
                        </p>
                      </div>
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Reports Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="flex gap-4">
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

          {/* Transaction Trend Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transaction Trend
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={transactionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="inValue" stroke="#10b981" name="Stock In" />
                  <Line type="monotone" dataKey="outValue" stroke="#ef4444" name="Stock Out" />
                  <Line type="monotone" dataKey="netValue" stroke="#3b82f6" name="Net Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Summary Table */}
          <div className="card overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daily Transaction Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Total Transactions</th>
                      <th className="table-header">Stock In</th>
                      <th className="table-header">Stock Out</th>
                      <th className="table-header">In Value</th>
                      <th className="table-header">Out Value</th>
                      <th className="table-header">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionSummary.map((summary) => (
                      <tr key={summary.date}>
                        <td className="table-cell font-medium">
                          {format(new Date(summary.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="table-cell">{summary.totalTransactions}</td>
                        <td className="table-cell text-green-600">{summary.inTransactions}</td>
                        <td className="table-cell text-red-600">{summary.outTransactions}</td>
                        <td className="table-cell text-green-600">${summary.totalInValue.toFixed(2)}</td>
                        <td className="table-cell text-red-600">${summary.totalOutValue.toFixed(2)}</td>
                        <td className={`table-cell font-medium ${
                          summary.netValue >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${summary.netValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
