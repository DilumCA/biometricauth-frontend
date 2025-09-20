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
import WalletManager from './WalletManager';

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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

    {/* Header - Mobile Optimized */}
      <header className="relative z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60">
                    Manage your secure authentication
                  </p>
                </div>
              </div>
            </div>
            
            {/* Logout Button - Mobile Optimized */}
            <div className="flex justify-end">
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
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 group text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

     <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* ... existing profile card and security overview code ... */}
          {/* Profile Card - Mobile First */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-white/60 mb-2 text-sm sm:text-base">@{user.username}</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-xs sm:text-sm text-green-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
            
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-white/70">Status</span>
                </div>
                <p className="text-green-400 font-semibold text-sm sm:text-base">Active</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Key className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-white/70">User ID</span>
                </div>
                <p className="text-white font-mono text-xs sm:text-sm bg-white/10 px-2 py-1 rounded-lg inline-block truncate max-w-full">
                  {user.userId?.slice(0, 8) || 'N/A'}...
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-white/70">Joined</span>
                </div>
                <p className="text-white font-medium text-sm sm:text-base">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

           {/* Security Overview - Mobile Optimized */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Security</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="text-white font-medium text-sm sm:text-base">Password</span>
                  </div>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <p className="text-white/60 text-xs sm:text-sm">Traditional auth enabled</p>
              </div>

               <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="text-white font-medium text-sm sm:text-base">Biometric</span>
                  </div>
                  {userInfo?.hasPasskeys ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  )}
                </div>
                <p className="text-white/60 text-xs sm:text-sm">
                  {userInfo?.hasPasskeys ? `${userInfo.credentialCount} device(s) registered` : 'Not configured'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-white font-medium text-xs sm:text-sm">Security Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 sm:h-2">
                    <div className={`h-1.5 sm:h-2 rounded-full ${userInfo?.hasPasskeys ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full' : 'bg-gradient-to-r from-yellow-400 to-orange-500 w-3/4'}`}></div>
                  </div>
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {userInfo?.hasPasskeys ? '100%' : '75%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

           {/* Add this right before your biometric management section */}
          <div className="lg:col-span-3">
            <WalletManager user={user} />
          </div>

           {/* Biometric Management - Mobile Optimized */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Fingerprint className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Biometric Authentication</h3>
                <p className="text-white/60 text-sm sm:text-base">Manage your secure login methods</p>
              </div>
            </div>

            {userInfo?.hasPasskeys ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-green-100 mb-2">Biometric Authentication Active</h4>
                      <p className="text-green-200/80 mb-4 text-sm sm:text-base">
                        You can now sign in using your fingerprint or face recognition. 
                        You have <span className="font-semibold text-green-100">{userInfo.credentialCount}</span> biometric device(s) registered.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={onSetupBiometric}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-lg sm:rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base"
                        >
                          <Plus className="w-4 h-4" />
                          Add Device
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device List */}
              {devices.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                    <h5 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      Registered Devices ({devices.length})
                    </h5>
                    <div className="space-y-3">
                      {devices.map((device) => (
                        <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              {getDeviceIcon(device.type, device.authenticatorType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">{device.name}</p>
                                {device.browser && (
                                  <div className="flex items-center gap-1">
                                    {getBrowserIcon(device.browser)}
                                    <span className="text-xs text-gray-400">{device.browser}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-white/60">
                                <span>Added {new Date(device.createdAt).toLocaleDateString()}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">Last used: {formatLastUsed(device.lastUsed)}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="capitalize">{device.type}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            disabled={loading}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 self-start sm:self-center"
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
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-blue-100 mb-2">Enable Biometric Authentication</h4>
                      <p className="text-blue-200/80 text-sm sm:text-base">
                        Enhance your account security with fingerprint or face recognition. 
                        Experience faster, more secure access to your account.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onSetupBiometric}
                    disabled={loading}
                    className="flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
                    {loading ? 'Setting up...' : 'Enable Biometric Auth'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions - Mobile Optimized */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Quick Actions</h3>
                <p className="text-white/60 text-sm sm:text-base">Manage your account settings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <button className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Change Password</h4>
                <p className="text-white/60 text-xs sm:text-sm">Update your account password</p>
              </button>
              
              <button className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Test Biometric</h4>
                <p className="text-white/60 text-xs sm:text-sm">Verify biometric functionality</p>
              </button>

              <button className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 text-left sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Update Profile</h4>
                <p className="text-white/60 text-xs sm:text-sm">Edit your account information</p>
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