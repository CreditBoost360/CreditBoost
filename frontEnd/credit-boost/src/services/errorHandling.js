import { toast } from '@/components/ui/use-toast';

/**
 * Global error handling service
 * Provides centralized error handling for the application
 */
export const errorHandler = {
  /**
   * Handle API errors with appropriate UI feedback
   * @param {Error} error - The error object
   * @param {Object} options - Additional options
   * @returns {Object} Processed error information
   */
  handleApiError: (error, options = {}) => {
    const { showToast = true, redirectOnAuthError = true } = options;
    
    // Default error message
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    // Extract error details from various error formats
    if (error.response) {
      // Server responded with error status
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || errorMessage;
      errorCode = error.response.data?.code || `ERROR_${statusCode}`;
      
      // Handle specific status codes
      switch (statusCode) {
        case 400:
          errorMessage = error.response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          if (redirectOnAuthError) {
            // Store current path for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            // Redirect to login
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Our team has been notified.';
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection.';
      errorCode = 'NETWORK_ERROR';
      statusCode = 0;
    } else {
      // Error in setting up the request
      errorMessage = error.message || errorMessage;
      errorCode = 'REQUEST_SETUP_ERROR';
    }
    
    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: `Error ${statusCode ? `(${statusCode})` : ''}`,
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    // Log error for debugging
    console.error(`[${errorCode}]`, error);
    
    // Return processed error information
    return {
      message: errorMessage,
      code: errorCode,
      status: statusCode,
      originalError: error
    };
  },
  
  /**
   * Handle form validation errors
   * @param {Object} errors - Form validation errors
   * @returns {Object} Processed validation errors
   */
  handleValidationErrors: (errors) => {
    // Show toast with first error message
    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive"
      });
    }
    
    return errors;
  },
  
  /**
   * Global error boundary handler for React components
   * @param {Error} error - The error object
   * @param {Object} errorInfo - React error info
   */
  handleComponentError: (error, errorInfo) => {
    // Log error to console
    console.error('Component error:', error, errorInfo);
    
    // Show toast notification
    toast({
      title: "Application Error",
      description: "Something went wrong. Please refresh the page.",
      variant: "destructive"
    });
    
    // Here you could send the error to your error tracking service
    // Example: Sentry.captureException(error);
  }
};

/**
 * Error boundary component for React
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    errorHandler.handleComponentError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The application encountered an error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}