import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { productsApi, suppliersApi } from '../../utils/api';
import type { Product, Supplier, CreateProductRequest } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Products: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductRequest>();

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getActive();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
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

  const onSubmit = async (data: CreateProductRequest) => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(data);
        toast.success('Product created successfully');
      }
      fetchProducts();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      category: product.category,
      sku: product.sku,
      description: product.description,
      priceIn: product.priceIn,
      priceOut: product.priceOut,
      minimumStock: product.minimumStock,
      supplierId: product.supplierId,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    reset();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <table className="table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Category</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Stock</th>
              <th className="table-header">Price In</th>
              <th className="table-header">Price Out</th>
              <th className="table-header">Supplier</th>
              <th className="table-header">Status</th>
              {isAdmin() && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="table-cell font-medium">{product.name}</td>
                <td className="table-cell">{product.category || 'N/A'}</td>
                <td className="table-cell">{product.sku || 'N/A'}</td>
                <td className="table-cell">
                  <span className={`font-medium ${
                    product.stock <= product.minimumStock ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    (min: {product.minimumStock})
                  </span>
                </td>
                <td className="table-cell">${product.priceIn.toFixed(2)}</td>
                <td className="table-cell">${product.priceOut.toFixed(2)}</td>
                <td className="table-cell">{product.supplierName || 'N/A'}</td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock <= product.minimumStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock <= product.minimumStock ? 'Low Stock' : 'Normal'}
                  </span>
                </td>
                {isAdmin() && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="form-input"
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <input {...register('category')} className="form-input" />
                </div>

                <div>
                  <label className="form-label">SKU</label>
                  <input {...register('sku')} className="form-input" />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea {...register('description')} className="form-input" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Price In</label>
                    <input
                      {...register('priceIn', { 
                        required: 'Price in is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      type="number"
                      step="0.01"
                      className="form-input"
                    />
                    {errors.priceIn && <p className="text-red-600 text-sm">{errors.priceIn.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Price Out</label>
                    <input
                      {...register('priceOut', { 
                        required: 'Price out is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      type="number"
                      step="0.01"
                      className="form-input"
                    />
                    {errors.priceOut && <p className="text-red-600 text-sm">{errors.priceOut.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="form-label">Minimum Stock</label>
                  <input
                    {...register('minimumStock', { 
                      min: { value: 0, message: 'Minimum stock cannot be negative' }
                    })}
                    type="number"
                    className="form-input"
                  />
                  {errors.minimumStock && <p className="text-red-600 text-sm">{errors.minimumStock.message}</p>}
                </div>

                <div>
                  <label className="form-label">Supplier</label>
                  <select {...register('supplierId')} className="form-input">
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Update' : 'Create'}
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

export default Products;
