// src/components/forms/Checkbox.tsx
import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary ${className}`}
            {...props}
          />
          <span className="ml-2 text-sm text-gray-700">{label}</span>
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;