import { Fingerprint } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

const BiometricLoader = ({ message = 'Processing biometric authentication...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Fingerprint className="w-8 h-8 text-purple-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Biometric Authentication</h3>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
};

export { LoadingSpinner, BiometricLoader };
