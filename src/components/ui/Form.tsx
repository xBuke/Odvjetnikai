'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, required = false, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface FormInputProps {
  type?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  className?: string;
}

export function FormInput({ 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  min,
  max,
  step,
  maxLength,
  className = ""
}: FormInputProps) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      className={`w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] bg-input text-foreground transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
    />
  );
}

interface FormTextareaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  rows = 3,
  className = ""
}: FormTextareaProps) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] bg-input text-foreground transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
    />
  );
}

interface FormSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormSelect({ 
  name, 
  value, 
  onChange, 
  required = false,
  children,
  className = ""
}: FormSelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)] bg-input text-foreground transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
    >
      {children}
    </select>
  );
}

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  className?: string;
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  submitText = "Save", 
  cancelText = "Cancel",
  isLoading = false,
  className = ""
}: FormActionsProps) {
  return (
    <div className={`flex items-center justify-end space-x-4 pt-6 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Saving...' : submitText}
      </button>
    </div>
  );
}
