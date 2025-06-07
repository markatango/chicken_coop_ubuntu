import Modal from '../components/modal';
import Button from '../components/button';
import Card from '../components/card';
import LoadingSpinner from '../components/loadingspinner';
import StatusIndicator from '../components/statusindicator';
import FormInput from '../components/forminput';
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Clock, DoorOpen, DoorClosed, Users, Shield, Settings, Trash2, UserPlus } from 'lucide-react';
import { useFormValidation } from '../hooks/hooks';
import userService from '../services/userService';

const AdminPage = ({ user, onLogout, onNavigateHome }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  const { formData: newUserData, errors, handleInputChange, setError, clearErrors, resetForm } = useFormValidation({
    email: '',
    displayName: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async () => {
    const newErrors = {};
    
    if (!newUserData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(newUserData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!newUserData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([field, message]) => {
        setError(field, message);
      });
      return;
    }
    
    try {
      const createdUser = await userService.createUser({
        ...newUserData,
        createdBy: user.uid
      });
      setUsers(prev => [...prev, createdUser]);
      resetForm();
      setShowCreateUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setError('submit', 'Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              Administration Panel
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={onNavigateHome}
                icon={Settings}
              >
                Control Panel
              </Button>
              <span className="text-gray-600">Welcome, {user.displayName}</span>
              <Button
                variant="danger"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="mr-2" size={24} />
              User Management
            </h2>
            <Button
              variant="success"
              onClick={() => setShowCreateUser(true)}
              icon={UserPlus}
            >
              Add User
            </Button>
          </div>

          {loading ? (
            <div className="py-8">
              <LoadingSpinner text="Loading users..." />
            </div>
          ) : (
            <UserTable
              users={users}
              currentUserId={user.uid}
              onRoleChange={handleRoleChange}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateUser}
          onClose={() => {
            setShowCreateUser(false);
            resetForm();
          }}
          title="Create New User"
        >
          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={newUserData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter email address"
            />

            <FormInput
              label="Display Name"
              name="displayName"
              value={newUserData.displayName}
              onChange={handleInputChange}
              error={errors.displayName}
              placeholder="Enter display name"
            />

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateUser(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="purple"
              onClick={handleCreateUser}
            >
              Create User
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default AdminPage;
