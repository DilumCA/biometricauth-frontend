import { useState } from 'react';
import { Eye, EyeOff, Fingerprint, User, Lock, UserPlus } from 'lucide-react';
import Dashboard from './Dashboard';
import { useNotification } from './Notification';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: ''
  });

  const { showNotification, NotificationComponent } = useNotification();
  
  // Use environment variable 
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        showNotification('success', data.message);
        if (!isLogin) {
          setIsLogin(true); // Switch to login after successful signup
        }
      } else {
        showNotification('error', data.message);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupBiometric = async () => {
    if (!user) {
      showNotification('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Begin biometric registration
      const beginResponse = await fetch(`${API_BASE}/webauthn/register/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      });

      const beginData = await beginResponse.json();
      if (!beginData.success) {
        showNotification('error', beginData.message);
        return;
      }

      // Step 2: Create credentials using WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: {
          ...beginData.options,
          challenge: new Uint8Array(beginData.options.challenge),
          user: {
            ...beginData.options.user,
            id: new Uint8Array(beginData.options.user.id),
          },
          excludeCredentials: beginData.options.excludeCredentials?.map(cred => ({
            ...cred,
            id: new Uint8Array(cred.id),
          })),
        },
      });

      // Step 3: Send credential to server for verification
      const finishResponse = await fetch(`${API_BASE}/webauthn/register/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            },
            type: credential.type,
          },
        }),
      });

      const finishData = await finishResponse.json();
      if (finishData.success) {
        showNotification('success', 'Biometric authentication setup successful!');
        // Update user state to reflect biometric availability
        setUser(prev => ({ ...prev, hasPasskeys: true }));
      } else {
        showNotification('error', finishData.message);
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      if (error.name === 'NotSupportedError') {
        showNotification('error', 'Biometric authentication is not supported on this device.');
      } else if (error.name === 'NotAllowedError') {
        showNotification('warning', 'Biometric setup was cancelled.');
      } else {
        showNotification('error', 'Biometric setup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const biometricLogin = async () => {
    if (!formData.username) {
      showNotification('warning', 'Please enter your username first');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Begin biometric authentication
      const beginResponse = await fetch(`${API_BASE}/webauthn/authenticate/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username }),
      });

      const beginData = await beginResponse.json();
      if (!beginData.success) {
        showNotification('error', beginData.message);
        return;
      }

      // Step 2: Get assertion using WebAuthn API
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...beginData.options,
          challenge: new Uint8Array(beginData.options.challenge),
          allowCredentials: beginData.options.allowCredentials?.map(cred => ({
            ...cred,
            id: new Uint8Array(cred.id),
          })),
        },
      });

      // Step 3: Send assertion to server for verification
      const finishResponse = await fetch(`${API_BASE}/webauthn/authenticate/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          credential: {
            id: assertion.id,
            rawId: Array.from(new Uint8Array(assertion.rawId)),
            response: {
              authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
              signature: Array.from(new Uint8Array(assertion.response.signature)),
              userHandle: assertion.response.userHandle ? Array.from(new Uint8Array(assertion.response.userHandle)) : null,
            },
            type: assertion.type,
          },
        }),
      });

      const finishData = await finishResponse.json();
      if (finishData.success) {
        setUser(finishData.user);
        showNotification('success', 'Biometric login successful!');
      } else {
        showNotification('error', finishData.message);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      if (error.name === 'NotSupportedError') {
        showNotification('error', 'Biometric authentication is not supported on this device.');
      } else if (error.name === 'NotAllowedError') {
        showNotification('warning', 'Biometric authentication was cancelled.');
      } else {
        showNotification('error', 'Biometric login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      password: ''
    });
  };

  if (user) {
    return (
      <>
        <Dashboard 
          user={user} 
          onLogout={logout}
          onSetupBiometric={setupBiometric}
        />
        <NotificationComponent />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Biometric Auth</h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
                isLogin
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-l-0 border ${
                !isLogin
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleTraditionalAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <Lock className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Login' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <button
                onClick={biometricLogin}
                disabled={loading || !formData.username}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-5 h-5" />
                {loading ? 'Authenticating...' : 'Login with Biometric'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Enter username first, then use biometric login
              </p>
            </>
          )}
        </div>
        <NotificationComponent />
      </div>
    </>
  );
};

export default AuthForm;