import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { suppliersApi } from '../../utils/api';
import type { Supplier, CreateSupplierRequest } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Suppliers: React.FC = () => {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierRequest>();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersApi.getActive();
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateSupplierRequest) => {
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, data);
        toast.success('Supplier updated successfully');
      } else {
        await suppliersApi.create(data);
        toast.success('Supplier created successfully');
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersApi.delete(id);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      contactPerson: supplier.contactPerson,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    reset();
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your suppliers</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search suppliers..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Suppliers Table */}
      <div className="card overflow-hidden">
        <table className="table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Contact Person</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Email</th>
              <th className="table-header">Address</th>
              <th className="table-header">Status</th>
              {isAdmin() && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="table-cell font-medium">{supplier.name}</td>
                <td className="table-cell">{supplier.contactPerson || 'N/A'}</td>
                <td className="table-cell">{supplier.phone || 'N/A'}</td>
                <td className="table-cell">{supplier.email || 'N/A'}</td>
                <td className="table-cell">
                  <div className="max-w-xs truncate" title={supplier.address || 'N/A'}>
                    {supplier.address || 'N/A'}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    supplier.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isAdmin() && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
                  <label className="form-label">Contact Person</label>
                  <input {...register('contactPerson')} className="form-input" />
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <input {...register('phone')} className="form-input" />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="form-input"
                  />
                  {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea {...register('address')} className="form-input" rows={3} />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingSupplier ? 'Update' : 'Create'}
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

export default Suppliers;
