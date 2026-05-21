import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center mt-2">
          <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

