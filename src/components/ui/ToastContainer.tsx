import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import useErrorStore from '../../store/errorStore';
import { ErrorResponse, ErrorSeverity } from '../../types';
import { AlertCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/**
 * Component for displaying toast notifications
 * Integrates with the global error store
 */
const ToastContainer: React.FC = () => {
  const { currentError, isErrorVisible, hideError } = useErrorStore();

  // Show toast when error is set in the global store
  useEffect(() => {
    if (currentError && isErrorVisible) {
      showErrorToast(currentError);
      // Auto-hide the error from the store after displaying
      hideError();
    }
  }, [currentError, isErrorVisible, hideError]);

  /**
   * Show an error toast with styling based on severity
   */
  const showErrorToast = (error: ErrorResponse) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden`}
        >
          <div className={getToastBgColor(error.severity)}>
            <div className="flex p-4">
              <div className="flex-shrink-0">{getToastIcon(error.severity)}</div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${getToastTextColor(error.severity)}`}>
                  {error.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: getDurationBySeverity(error.severity),
        position: 'top-right',
      }
    );
  };

  /**
   * Get toast background color based on error severity
   */
  const getToastBgColor = (severity?: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border border-red-300';
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border border-red-200';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border border-yellow-200';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border border-blue-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  };

  /**
   * Get toast text color based on error severity
   */
  const getToastTextColor = (severity?: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'text-red-800';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-800';
      case ErrorSeverity.LOW:
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  /**
   * Get toast icon based on error severity
   */
  const getToastIcon = (severity?: ErrorSeverity): JSX.Element => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case ErrorSeverity.HIGH:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case ErrorSeverity.LOW:
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * Get toast duration based on error severity
   */
  const getDurationBySeverity = (severity?: ErrorSeverity): number => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 8000; // Keep critical errors visible longer
      case ErrorSeverity.HIGH:
        return 5000;
      case ErrorSeverity.MEDIUM:
        return 4000;
      case ErrorSeverity.LOW:
        return 3000;
      default:
        return 4000;
    }
  };

  return <Toaster />;
};

export default ToastContainer;