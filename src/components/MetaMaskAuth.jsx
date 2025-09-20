import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useNotification } from './Notification';
import MetaMaskNotInstalled from './MetaMaskNotInstalled';

const MetaMaskAuth = ({ 
  username, 
  loading, 
  setLoading, 
  onSuccess, 
  isRegistration = false,
  formData = {} 
}) => {
  const [connecting, setConnecting] = useState(false);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const { showNotification } = useNotification();
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  const handleMetaMaskAuth = async () => {
    if (!isMetaMaskInstalled()) {
      setShowMetaMaskModal(true);
      return;
    }

    // For login, require username
    if (!isRegistration && !username) {
      showNotification('warning', 'Please enter your username first');
      return;
    }

    setConnecting(true);
    setLoading(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      const address = accounts[0];
      
      // Step 1: Get challenge
      const beginResponse = await fetch(`${API_BASE}/wallet/authenticate/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      const beginData = await beginResponse.json();
      if (!beginData.success) {
        throw new Error(beginData.message || 'Failed to start authentication');
      }
      
      // Step 2: Sign the challenge
      const { challenge } = beginData;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challenge.message, address]
      });
      
      // Step 3: Verify signature and authenticate
      const finishBody = {
        address,
        signature,
        nonce: challenge.nonce
      };
      
      // If this is a new wallet not linked to any account
      if (!beginData.isRegistered) {
        if (isRegistration) {
          // Registration: Creating a new account with wallet
          finishBody.isNewAccount = true;
          finishBody.username = formData.username;
          finishBody.accountDetails = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email
          };
        } else if (username) {
          // Login: Link wallet to existing account
          finishBody.username = username;
          finishBody.isNewAccount = false;
        } else {
          throw new Error('Username is required to link wallet to an account');
        }
      } else if (beginData.username && username && beginData.username !== username) {
        // Direct handling for the wallet linked to different account scenario
        console.log("WALLET LINKED TO DIFFERENT ACCOUNT DETECTED");
        showNotification(
          'warning', 
          <div className="flex flex-col gap-1">
            <p>This wallet is already linked to another account.</p>
            <p className="text-xs font-medium mt-1">
              Please use the wallet with username "<span className="font-bold">{beginData.username}</span>" 
              or connect a different wallet.
            </p>
          </div>,
          8000 // Show for longer (8 seconds)
        );
        return; // Exit early
      }
      
      const finishResponse = await fetch(`${API_BASE}/wallet/authenticate/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finishBody),
      });
      
      const finishData = await finishResponse.json();
      
      if (finishData.success) {
        showNotification('success', finishData.message || 'Wallet authentication successful');
        onSuccess(finishData.user);
      } else {
        throw new Error(finishData.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('MetaMask authentication error:', error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        showNotification('warning', 'You rejected the MetaMask connection.');
      } else if (error.message && error.message.includes("wallet is already linked to account")) {
        // Extract username from error message as fallback
        const usernameMatch = error.message.match(/"([^"]+)"/);
        const linkedUsername = usernameMatch ? usernameMatch[1] : "another user";
        
        showNotification(
          'warning', 
          <div className="flex flex-col gap-1">
            <p>This wallet is already linked to another account.</p>
            <p className="text-xs font-medium mt-1">
              Please use the wallet with username "<span className="font-bold">{linkedUsername}</span>" 
              or connect a different wallet.
            </p>
          </div>,
          8000 // Show for longer (8 seconds)
        );
      } else {
        showNotification('error', error.message || 'Failed to authenticate with MetaMask.');
      }
    } finally {
      setConnecting(false);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleMetaMaskAuth}
        disabled={loading || connecting}
        className="w-full bg-orange-500/80 hover:bg-orange-500 text-white py-3 sm:py-4 px-6 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base"
      >
        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        {loading || connecting ? 'Connecting...' : isRegistration ? 'Sign up with MetaMask' : 'Connect with MetaMask'}
      </button>
      
      {showMetaMaskModal && (
        <MetaMaskNotInstalled onClose={() => setShowMetaMaskModal(false)} />
      )}
    </>
  );
};

export default MetaMaskAuth;