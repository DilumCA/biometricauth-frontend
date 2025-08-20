import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { useNotification } from '../components/Notification';

// Move utility functions from AuthForm here
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

function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceName = 'Unknown Device';
  let deviceType = 'unknown';
  
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const match = userAgent.match(/iPhone OS (\d+_\d+)/);
    const version = match ? match[1].replace('_', '.') : '';
    deviceName = /iPad/i.test(userAgent) ? `iPad ${version}` : `iPhone ${version}`;
    deviceType = 'mobile';
  } else if (/Android/i.test(userAgent)) {
    const match = userAgent.match(/Android (\d+\.?\d*)/);
    const version = match ? match[1] : '';
    deviceName = `Android ${version}`;
    deviceType = 'mobile';
  } else if (/Windows NT/i.test(userAgent)) {
    const match = userAgent.match(/Windows NT (\d+\.?\d*)/);
    const version = match ? match[1] : '';
    deviceName = `Windows ${version}`;
    deviceType = 'desktop';
  } else if (/Mac OS X/i.test(userAgent)) {
    const match = userAgent.match(/Mac OS X (\d+_\d+)/);
    const version = match ? match[1].replace('_', '.') : '';
    deviceName = `macOS ${version}`;
    deviceType = 'desktop';
  } else if (/Linux/i.test(userAgent)) {
    deviceName = 'Linux';
    deviceType = 'desktop';
  }
  
  let browser = 'Unknown Browser';
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Edge/i.test(userAgent)) {
    browser = 'Edge';
  }
  
  return {
    name: `${deviceName} (${browser})`,
    type: deviceType,
    browser: browser,
    userAgent: userAgent
  };
}

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const setupBiometric = async () => {
    if (!user) {
      showNotification('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
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

      const credential = await navigator.credentials.create({
        publicKey: {
          ...beginData.options,
          challenge: base64urlToBuffer(beginData.options.challenge),
          user: {
            ...beginData.options.user,
            id: base64urlToBuffer(beginData.options.user.id),
          },
          excludeCredentials: beginData.options.excludeCredentials?.map(cred => ({
            ...cred,
            id: base64urlToBuffer(cred.id),
          })),
        },
      });

      const credentialJSON = publicKeyCredentialToJSON(credential);
      const deviceInfo = getDeviceInfo();

      const finishResponse = await fetch(`${API_BASE}/webauthn/register/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          credential: credentialJSON,
          deviceInfo: deviceInfo,
        }),
      });

      const finishData = await finishResponse.json();
      if (finishData.success) {
        showNotification('success', `Biometric authentication setup successful! Device "${finishData.device?.name}" has been registered.`);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout}
      onSetupBiometric={setupBiometric}
    />
  );
};

export default DashboardPage;