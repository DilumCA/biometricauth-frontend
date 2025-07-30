import { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Fingerprint, 
  Key, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle,
  Info,
  Trash2
} from 'lucide-react';

const Dashboard = ({ user, onLogout, onSetupBiometric }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use environment variable with fallback
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/auth`;

  useEffect(() => {
    fetchUserInfo();
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/${user.username}`);
      const data = await response.json();
      
      if (data.success) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleRemoveBiometric = async () => {
    if (!confirm('Are you sure you want to remove biometric authentication? You will need to set it up again.')) {
      return;
    }

    // Note: This would require a backend endpoint to remove credentials
    // For now, we'll just show a placeholder
    alert('Remove biometric functionality would need to be implemented in the backend.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Biometric Auth Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your authentication settings</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Status</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {user.userId || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Traditional authentication</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Biometric Authentication</p>
                    <p className="text-xs text-gray-500">
                      {userInfo?.hasPasskeys ? 'Fingerprint/Face ID enabled' : 'Not configured'}
                    </p>
                  </div>
                </div>
                {userInfo?.hasPasskeys ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Biometric Management Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Biometric Authentication</h3>
            </div>

            {userInfo?.hasPasskeys ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Biometric Authentication Enabled</h4>
                    <p className="text-sm text-green-700 mt-1">
                      You can now log in using your fingerprint or face recognition. 
                      You have {userInfo.credentialCount} biometric credential(s) registered.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onSetupBiometric}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add Another Device
                  </button>
                  <button
                    onClick={handleRemoveBiometric}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Biometric
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Set Up Biometric Authentication</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Enhance your account security by enabling fingerprint or face recognition login.
                      This provides a faster and more secure way to access your account.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onSetupBiometric}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Fingerprint className="w-5 h-5" />
                  {loading ? 'Setting up...' : 'Enable Biometric Authentication'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <Key className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your password</p>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group">
                <Fingerprint className="w-6 h-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Test Biometric</p>
                <p className="text-xs text-gray-500">Test your biometric login</p>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group">
                <User className="w-6 h-6 text-gray-600 group-hover:text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Update Profile</p>
                <p className="text-xs text-gray-500">Edit your information</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;