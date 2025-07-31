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
  Trash2,
  Plus,
  Zap,
  Lock,
  Activity,
  Calendar,
  Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Biometric Dashboard
                </h1>
                <p className="text-white/60">
                  Manage your secure authentication
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-white/60 mb-2">@{user.username}</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm text-white/70">Status</span>
                </div>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-white/70">User ID</span>
                </div>
                <p className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded-lg inline-block">
                  {user.userId?.slice(0, 8) || 'N/A'}...
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm text-white/70">Joined</span>
                </div>
                <p className="text-white font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Security Overview */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Password</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white/60 text-sm">Traditional auth enabled</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Biometric</span>
                  </div>
                  {userInfo?.hasPasskeys ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-white/60 text-sm">
                  {userInfo?.hasPasskeys ? 'TouchID/FaceID active' : 'Not configured'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium text-sm">Security Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${userInfo?.hasPasskeys ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full' : 'bg-gradient-to-r from-yellow-400 to-orange-500 w-3/4'}`}></div>
                  </div>
                  <span className="text-white font-bold text-sm">
                    {userInfo?.hasPasskeys ? '100%' : '75%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Management */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Biometric Authentication</h3>
                <p className="text-white/60">Manage your secure login methods</p>
              </div>
            </div>

            {userInfo?.hasPasskeys ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-green-100 mb-2">Biometric Authentication Active</h4>
                      <p className="text-green-200/80 mb-4">
                        You can now sign in using your fingerprint or face recognition. 
                        You have <span className="font-semibold text-green-100">{userInfo.credentialCount}</span> biometric credential(s) registered.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={onSetupBiometric}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add Device
                        </button>
                        <button
                          onClick={handleRemoveBiometric}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-blue-100 mb-2">Enable Biometric Authentication</h4>
                      <p className="text-blue-200/80">
                        Enhance your account security with fingerprint or face recognition. 
                        Experience faster, more secure access to your account.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onSetupBiometric}
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Fingerprint className="w-5 h-5" />
                    {loading ? 'Setting up...' : 'Enable Biometric Auth'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                <p className="text-white/60">Manage your account settings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 text-left">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Change Password</h4>
                <p className="text-white/60 text-sm">Update your account password</p>
              </button>
              
              <button className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-left">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Test Biometric</h4>
                <p className="text-white/60 text-sm">Verify biometric functionality</p>
              </button>
              
              <button className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 text-left">
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Update Profile</h4>
                <p className="text-white/60 text-sm">Edit your account information</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;