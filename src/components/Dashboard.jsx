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
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Globe,
  AlertTriangle,
  X
} from 'lucide-react';
import { useNotification } from './Notification';

const Dashboard = ({ user, onLogout, onSetupBiometric }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // Add this line

  const { showNotification, NotificationComponent } = useNotification();
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/auth`;

  // Add this function
  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  // Add this component
  const ConfirmDialog = () => {
    if (!confirmDialog) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={confirmDialog.onCancel}
        />
        
        {/* Dialog */}
        <div className="relative bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 p-8 max-w-md mx-4">
          {/* Close button */}
          <button
            onClick={confirmDialog.onCancel}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-red-100 mb-4">
            {confirmDialog.title}
          </h3>

          {/* Message */}
          <div className="text-white/80 mb-8 leading-relaxed">
            {typeof confirmDialog.message === 'string' ? (
              <p>{confirmDialog.message}</p>
            ) : (
              confirmDialog.message
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={confirmDialog.onCancel}
              className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
            >
              {confirmDialog.cancelText || 'Cancel'}
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              {confirmDialog.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchUserInfo();
    fetchDevices();
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

  const fetchDevices = async () => {
    if (!userInfo?.hasPasskeys) return;
    
    try {
      const response = await fetch(`${API_BASE}/user/${user.username}/devices`);
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // Re-fetch devices when userInfo changes
  useEffect(() => {
    if (userInfo?.hasPasskeys) {
      fetchDevices();
    }
  }, [userInfo?.hasPasskeys]);

  const handleDeleteDevice = async (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    const deviceName = device?.name || 'this device';

    const confirmed = await showConfirm({
      title: 'Remove Biometric Device',
      message: (
        <div>
          <p className="mb-4">
            Are you sure you want to remove "<strong>{deviceName}</strong>" from your account?
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <p className="text-yellow-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              You will need to re-register this device to use biometric authentication again.
            </p>
          </div>
        </div>
      ),
      confirmText: 'Remove Device',
      cancelText: 'Keep Device'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webauthn/device/${user.username}/${deviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('success', `Successfully removed "${deviceName}"`);
        await fetchUserInfo();
        await fetchDevices();
      } else {
        showNotification('error', data.message);
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      showNotification('error', 'Failed to remove device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAllBiometrics = async () => {
    const confirmed = await showConfirm({
      title: 'Remove All Biometric Devices',
      message: (
        <div>
          <p className="mb-4">
            This action will remove <strong>ALL {userInfo?.credentialCount || 0} biometric device(s)</strong> from your account.
          </p>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              This will completely disable biometric authentication for your account.
            </p>
          </div>
          <p className="text-sm text-white/70">
            You will need to set up biometric authentication from scratch if you want to use it again.
          </p>
        </div>
      ),
      confirmText: 'Remove All Devices',
      cancelText: 'Cancel',
      type: 'danger',
      icon: AlertTriangle
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/webauthn/credentials/${user.username}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'All biometric devices removed successfully');
        await fetchUserInfo();
        setDevices([]);
      } else {
        showNotification('error', data.message);
      }
    } catch (error) {
      console.error('Error removing all biometrics:', error);
      showNotification('error', 'Failed to remove biometric authentication');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType, authenticatorType) => {
    if (authenticatorType === 'platform') {
      switch (deviceType) {
        case 'mobile':
          return <Smartphone className="w-5 h-5 text-purple-400" />;
        case 'tablet':
          return <Tablet className="w-5 h-5 text-purple-400" />;
        case 'desktop':
          return <Monitor className="w-5 h-5 text-purple-400" />;
        default:
          return <Fingerprint className="w-5 h-5 text-purple-400" />;
      }
    } else {
      return <Key className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBrowserIcon = (browser) => {
    switch (browser?.toLowerCase()) {
      case 'chrome':
        return <Chrome className="w-4 h-4 text-gray-400" />;
      default:
        return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatLastUsed = (lastUsed) => {
    if (!lastUsed) return 'Never used';
    
    const date = new Date(lastUsed);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* ... existing background and header code ... */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                   Dashboard
                </h1>
                <p className="text-white/60">
                  Manage your secure authentication
                </p>
              </div>
            </div>
            <div className="flex w-full sm:w-auto justify-end items-center">
  {/* Icon-only button for mobile */}
  <button
    onClick={async () => {
      const confirmed = await showConfirm({
        title: 'Confirm Logout',
        message: 'Are you sure you want to log out?',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      });
      if (confirmed) onLogout();
    }}
    className="inline-flex sm:hidden items-center justify-center p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 group mt-4 sm:mt-0"
    title="Logout"
  >
    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
    <span className="ml-2 text-sm font-medium">Logout</span>
  </button>
  {/* Full button for sm and up */}
  <button
    onClick={async () => {
      const confirmed = await showConfirm({
        title: 'Confirm Logout',
        message: 'Are you sure you want to log out?',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      });
      if (confirmed) onLogout();
    }}
    className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 group w-full sm:w-auto mt-4 sm:mt-0"
  >
    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
    Logout
  </button>
</div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-2 sm:px-4 py-6 overflow-x-hidden box-border">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 w-full overflow-x-auto min-w-0">
          {/* ... existing profile card and security overview code ... */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 w-full min-w-0 overflow-x-auto">
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

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 w-full min-w-0 overflow-x-auto">
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
                  {userInfo?.hasPasskeys ? `${userInfo.credentialCount} device(s) registered` : 'Not configured'}
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

          {/* Enhanced Biometric Management */}
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
                        You have <span className="font-semibold text-green-100">{userInfo.credentialCount}</span> biometric device(s) registered.
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
                        {/* <button
                          onClick={handleRemoveAllBiometrics}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove All
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device List */}
                {devices.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h5 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Registered Devices ({devices.length})
                    </h5>
                    <div className="space-y-3">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                              {getDeviceIcon(device.type, device.authenticatorType)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-medium">{device.name}</p>
                                {device.browser && (
                                  <div className="flex items-center gap-1">
                                    {getBrowserIcon(device.browser)}
                                    <span className="text-xs text-gray-400">{device.browser}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span>Added {new Date(device.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="hidden sm:inline">Last used: {formatLastUsed(device.lastUsed)}</span>
                                <span>•</span>
                                <span className="capitalize">{device.type}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            disabled={loading}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove this device"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

          {/* ... existing Quick Actions section ... */}
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

      <NotificationComponent />
      <ConfirmDialog />
    </div>
  );
};

export default Dashboard;