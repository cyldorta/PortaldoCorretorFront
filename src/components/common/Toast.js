import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      progressBar: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      progressBar: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      progressBar: 'bg-yellow-500',
    },
  };

  const config = types[type] || types.success;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slideIn">
      <div
        className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          border rounded-lg shadow-lg p-4 pr-12 min-w-[300px] max-w-md
          relative overflow-hidden
        `}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${config.iconColor} flex-shrink-0`} size={24} />
          
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>

          <button
            onClick={onClose}
            className={`absolute top-2 right-2 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className={`h-full ${config.progressBar} animate-shrink`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}

export default Toast;
