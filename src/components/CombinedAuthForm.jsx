import { useState } from 'react';
import { Eye, EyeOff, Fingerprint, User, Lock, UserPlus, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './Notification';

// Utility functions (copy from AuthForm)
function base64urlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const str = atob(base64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
}

function publicKeyCredentialToJSON(obj) {
  if (obj instanceof Array) {
    return obj.map(x => publicKeyCredentialToJSON(x));
  }
  if (obj instanceof ArrayBuffer) {
    return bufferToBase64url(obj);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (typeof obj[key] === 'function') continue;
      result[key] = publicKeyCredentialToJSON(obj[key]);
    }
    return result;
  }
  return obj;
}

function bufferToBase64url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const CombinedAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    password: ''
  });

  const navigate = useNavigate();
  const { showNotification, NotificationComponent } = useNotification();
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
      if (isLogin) {
        // Login: Store user and go to dashboard
        localStorage.setItem('user', JSON.stringify(data.user));
        showNotification('success', data.message);
        navigate('/dashboard');
      } else {
        // ✅ Signup: Store user and go directly to dashboard
        localStorage.setItem('user', JSON.stringify(data.user));
        showNotification('success', data.message);
        navigate('/dashboard');
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

  const biometricLogin = async () => {
    if (!formData.username) {
      showNotification('warning', 'Please enter your username first');
      return;
    }

    setLoading(true);
    try {
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

      const assertion = await navigator.credentials.get({
        publicKey: {
          ...beginData.options,
          challenge: base64urlToBuffer(beginData.options.challenge),
          allowCredentials: beginData.options.allowCredentials?.map(cred => ({
            ...cred,
            id: base64urlToBuffer(cred.id),
          })),
        },
      });

      const assertionJSON = publicKeyCredentialToJSON(assertion);

      const finishResponse = await fetch(`${API_BASE}/webauthn/authenticate/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          credential: assertionJSON,
        }),
      });

      const finishData = await finishResponse.json();
      if (finishData.success) {
        localStorage.setItem('user', JSON.stringify(finishData.user));
        showNotification('success', 'Biometric login successful!');
        navigate('/dashboard');
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

  return (
    <>
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {isLogin ? 'Welcome Back' : 'Welcome'}
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-base">
                    {isLogin ? 'Sign in to your secure account' : 'Create your secure account'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isLogin
                          ? 'bg-white text-gray-900 shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        !isLogin
                          ? 'bg-white text-gray-900 shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleTraditionalAuth} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-white/90">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-white/90">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white/90">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? <Lock className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              {/* Biometric login section - Only show for login */}
              {isLogin && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white/10 backdrop-blur-sm text-white/70 rounded-full text-xs">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={biometricLogin}
                    disabled={loading || !formData.username}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 sm:py-4 px-6 rounded-xl font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base"
                  >
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    {loading ? 'Authenticating...' : 'Sign in with Biometric'}
                  </button>

                  <p className="text-xs text-white/50 text-center">
                    Enter your username first, then use biometric authentication
                  </p>
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-white/50 text-xs sm:text-sm">
                Secured with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      <NotificationComponent />
    </>
  );
};

export default CombinedAuthForm;