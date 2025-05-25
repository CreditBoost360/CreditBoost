import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced form input component with validation and accessibility features
 */
export function FormInput({
  id,
  label,
  type = 'text',
  required = false,
  value,
  onChange,
  error,
  disabled = false,
  autoComplete,
  placeholder,
  className = '',
  helpText,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className={`block w-full rounded-lg border ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
        } px-3 py-2 shadow-sm dark:bg-gray-800 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * Enhanced submit button with loading state
 */
export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  loadingText = 'Processing...',
  ...props
}) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Social login button component
 */
export function SocialButton({
  provider,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const providerConfig = {
    google: {
      icon: 'google.svg',
      text: 'Google',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50',
      textColor: 'text-gray-700',
    },
    facebook: {
      icon: 'facebook.svg',
      text: 'Facebook',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-white',
    },
    apple: {
      icon: 'apple.svg',
      text: 'Apple',
      bgColor: 'bg-black',
      hoverColor: 'hover:bg-gray-900',
      textColor: 'text-white',
    },
  };
  
  const config = providerConfig[provider] || providerConfig.google;
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 ${config.bgColor} px-4 py-3 ${config.textColor} shadow-sm ${config.hoverColor} disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <img src={config.icon} className="w-5 h-5" alt={`${config.text} logo`} />
      <span>Continue with {config.text}</span>
    </button>
  );
}

/**
 * Form divider with text
 */
export function FormDivider({ text = 'Or' }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">{text}</span>
      </div>
    </div>
  );
}

/**
 * Password input with toggle visibility
 */
export function PasswordInput({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  error,
  disabled = false,
  autoComplete = 'current-password',
  required = true,
  ...props
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="space-y-1">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full rounded-lg border ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
          } px-3 py-2 pr-10 shadow-sm dark:bg-gray-800 dark:border-gray-700 disabled:opacity-70 disabled:cursor-not-allowed`}
          {...props}
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex="-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}