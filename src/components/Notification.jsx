import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({ type, message, isVisible, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg max-w-md ${getStyles()}`}>
        {getIcon()}
        <div className="text-sm font-medium flex-1">
          {/* Support both string and JSX content */}
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const useNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    message: '',
  });

  const showNotification = (type, message, duration = 5000) => {
    setNotification({
      isVisible: true,
      type,
      message,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const NotificationComponent = () => (
    <Notification
      {...notification}
      onClose={hideNotification}
    />
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
};

export { Notification, useNotification };
