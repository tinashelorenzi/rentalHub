// src/components/forms/DatePicker.tsx
import React, { forwardRef, useState } from 'react';
import { format } from 'date-fns';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  error?: string;
  hint?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    label, 
    value, 
    onChange, 
    error, 
    hint, 
    minDate, 
    maxDate, 
    placeholder = 'Select a date', 
    disabled = false 
  }, ref) => {
    const formatDateForInput = (date?: Date) => {
      return date ? format(date, 'yyyy-MM-dd') : '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange && e.target.value) {
        const newDate = new Date(e.target.value);
        onChange(newDate);
      }
    };

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            error
              ? 'border-red-300 focus:border-red-300'
              : 'border-gray-300 focus:border-primary'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={formatDateForInput(value)}
          onChange={handleChange}
          min={minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          placeholder={placeholder}
          disabled={disabled}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;