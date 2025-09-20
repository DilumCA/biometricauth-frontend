import { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Trash2, Plus, Link } from 'lucide-react';
import { useNotification } from './Notification';
import MetaMaskNotInstalled from './MetaMaskNotInstalled';

const WalletManager = ({ user }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user?.username) {
      fetchWallets();
    }
  }, [user]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/user/${user.username}/wallets`);
      const data = await response.json();
      
      if (data.success) {
        setWallets(data.wallets || []);
      } else {
        console.error('Error fetching wallets:', data.message);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
 if (!window.ethereum) {
      setShowMetaMaskModal(true);
      return;
    }

    setConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      const address = accounts[0];
      
      // Get challenge for the wallet
      const beginResponse = await fetch(`${API_BASE}/wallet/authenticate/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      
      const beginData = await beginResponse.json();
      if (!beginData.success) {
        throw new Error(beginData.message || 'Failed to start authentication');
      }
      
      // Sign the challenge
      const { challenge } = beginData;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challenge.message, address]
      });
      
      // Link wallet to existing account
      const finishResponse = await fetch(`${API_BASE}/wallet/authenticate/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature,
          nonce: challenge.nonce,
          username: user.username,
          isNewAccount: false
        }),
      });
      
      const finishData = await finishResponse.json();
      
      if (finishData.success) {
        showNotification('success', 'Wallet connected successfully');
        fetchWallets();
      } else {
        throw new Error(finishData.message || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        showNotification('warning', 'You rejected the MetaMask connection');
      } else {
        showNotification('error', error.message || 'Failed to connect wallet');
      }
    } finally {
      setConnecting(false);
    }
  };

  const removeWallet = async (address) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/wallet/${user.username}/${address}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Wallet disconnected successfully');
        fetchWallets();
      } else {
        showNotification('error', data.message || 'Failed to disconnect wallet');
      }
    } catch (error) {
      console.error('Error removing wallet:', error);
      showNotification('error', 'Failed to disconnect wallet');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Connected Wallets</h3>
        </div>
        <button
          onClick={connectWallet}
          disabled={loading || connecting}
          className="flex items-center gap-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-1 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          {connecting ? (
            <div className="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mr-1"></div>
          ) : (
            <Plus size={16} />
          )}
          Connect
        </button>
      </div>
      
      {loading && !connecting && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {!loading && wallets.length === 0 && (
        <div className="text-white/60 text-sm bg-white/5 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-3 bg-orange-500/10 rounded-full mb-2">
              <Link className="w-5 h-5 text-orange-400" />
            </div>
            <p>No wallets connected yet</p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="mt-2 text-orange-400 hover:text-orange-300 text-xs font-medium"
            >
              Connect your first wallet
            </button>
          </div>
        </div>
      )}
      
      {!loading && wallets.length > 0 && (
        <div className="space-y-2">
          {wallets.map(wallet => (
            <div key={wallet.address} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono">{formatAddress(wallet.address)}</span>
                  <a 
                    href={`https://etherscan.io/address/${wallet.address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="text-xs text-white/50">
                  Last used: {new Date(wallet.lastUsed).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => removeWallet(wallet.address)}
                disabled={loading || connecting}
                className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Disconnect wallet"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )} {showMetaMaskModal && (
        <MetaMaskNotInstalled onClose={() => setShowMetaMaskModal(false)} />
      )}
    </div>
  );
};

export default WalletManager;