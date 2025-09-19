import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { usersApi } from '../../utils/api';
import type { User, CreateUserRequest } from '../../types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserRequest>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, data);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(data);
        toast.success('User created successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await usersApi.delete(id);
        toast.success('User deactivated successfully');
        fetchUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Deactivation failed');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '', // Don't populate password for security
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    reset();
  };

  const filteredUsers = users.filter(user => {
    if (filterRole === 'ALL') return true;
    return user.role === filterRole;
  });

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users (Admin only)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="form-label">Filter by Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'ADMIN' | 'STAFF')}
            className="form-input"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">User</th>
              <th className="table-header">Username</th>
              <th className="table-header">Email</th>
              <th className="table-header">Role</th>
              <th className="table-header">Status</th>
              <th className="table-header">Created</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="table-cell">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-cell font-medium">{user.username}</td>
                <td className="table-cell">{user.email || 'N/A'}</td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-cell text-sm text-gray-500">
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={!user.active}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
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
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <input
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                    className="form-input"
                    disabled={!!editingUser} // Don't allow username change when editing
                  />
                  {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="form-label">Full Name</label>
                  <input {...register('fullName')} className="form-input" />
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
                  <label className="form-label">Role</label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="form-input"
                  >
                    <option value="">Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                  </select>
                  {errors.role && <p className="text-red-600 text-sm">{errors.role.message}</p>}
                </div>

                <div>
                  <label className="form-label">
                    {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                  </label>
                  <input
                    {...register('password', editingUser ? {} : { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    className="form-input"
                    placeholder={editingUser ? 'Leave empty to keep current password' : ''}
                  />
                  {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-500 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-500 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Admin Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-500 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.filter(u => u.active).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
