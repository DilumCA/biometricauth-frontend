import { AlertTriangle, Chrome, Globe, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';

const MetaMaskNotInstalled = ({ onClose }) => {
  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-md w-full">
        {/* Modal content (same as before) */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">MetaMask Required</h3>
            <p className="text-white/70 text-sm">MetaMask is not installed in your browser</p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-white/80 text-sm leading-relaxed">
            To connect your wallet, you need to install the MetaMask extension. MetaMask is a secure wallet that lets you interact with blockchain applications.
          </p>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-medium text-white mb-3">How to install MetaMask:</h4>
            <ol className="list-decimal pl-5 text-sm text-white/80 space-y-2">
              <li>Visit the <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline inline-flex items-center gap-1">
                MetaMask website <ExternalLink className="w-3 h-3" />
              </a></li>
              <li>Click the "Download" button for your browser</li>
              <li>Follow the installation instructions</li>
              <li>Set up a new wallet or import an existing one</li>
              <li>Return to this page and refresh</li>
            </ol>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a 
              href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <Chrome className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-white text-xs">Chrome</span>
            </a>
            <a 
              href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <Globe className="w-6 h-6 text-orange-400 mb-2" />
              <span className="text-white text-xs">Firefox</span>
            </a>
            <a 
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <Globe className="w-6 h-6 text-green-400 mb-2" />
              <span className="text-white text-xs">Others</span>
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-700 hover:to-amber-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MetaMaskNotInstalled;