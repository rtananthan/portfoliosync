import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut, Shield, Bell, Palette } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, signOut, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    givenName: user?.givenName || '',
    familyName: user?.familyName || '',
    preferences: {
      currency: user?.preferences?.currency || 'AUD',
      timezone: user?.preferences?.timezone || 'Australia/Sydney',
      theme: user?.preferences?.theme || 'light',
      notifications: {
        email: user?.preferences?.notifications?.email || true,
        push: user?.preferences?.notifications?.push || false,
        sms: user?.preferences?.notifications?.sms || false
      }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      givenName: user?.givenName || '',
      familyName: user?.familyName || '',
      preferences: {
        currency: user?.preferences?.currency || 'AUD',
        timezone: user?.preferences?.timezone || 'Australia/Sydney',
        theme: user?.preferences?.theme || 'light',
        notifications: {
          email: user?.preferences?.notifications?.email || true,
          push: user?.preferences?.notifications?.push || false,
          sms: user?.preferences?.notifications?.sms || false
        }
      }
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.givenName} {user.familyName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Profile Information */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.givenName}
                    onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="text-gray-900">{user.givenName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-gray-900">{user.familyName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <p className="text-gray-900">{user.preferences?.currency}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <p className="text-gray-900">{user.preferences?.timezone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <p className="text-gray-900 capitalize">{user.preferences?.theme}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email notifications</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user.preferences?.notifications?.email 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Push notifications</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user.preferences?.notifications?.push 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">SMS notifications</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user.preferences?.notifications?.sms 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Account Security
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account created</span>
              <span className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Last updated</span>
              <span className="text-gray-600">
                {new Date(user.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account status</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};