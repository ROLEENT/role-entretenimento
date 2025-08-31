/**
 * React Hook Form Types
 * 
 * Comprehensive type definitions for React Hook Form components and hooks.
 */

import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

// Base form field props that all form components should extend
export interface BaseFormFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  control?: Control<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

// RHF Controller render props with proper typing
export interface RHFRenderProps<T extends FieldValues = FieldValues> {
  field: {
    name: FieldPath<T>;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    ref: React.Ref<unknown>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: { 
      message?: string;
      type?: string;
    };
  };
  formState: {
    isSubmitting: boolean;
    isSubmitSuccessful: boolean;
    isValid: boolean;
    isLoading: boolean;
    errors: Record<string, unknown>;
    touchedFields: Record<string, boolean>;
    dirtyFields: Record<string, boolean>;
  };
}

// Select/Combobox option type
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
}

// Async select/combobox props
export interface AsyncSelectProps<T extends FieldValues = FieldValues> 
  extends BaseFormFieldProps<T> {
  loadOptions: (query: string) => Promise<SelectOption[]>;
  onCreate?: (label: string) => Promise<SelectOption>;
  onSelect?: (option: SelectOption) => void;
  multiple?: boolean;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  clearable?: boolean;
  debounceMs?: number;
}

// Multi-select specific props
export interface MultiSelectProps<T extends FieldValues = FieldValues>
  extends BaseFormFieldProps<T> {
  options: SelectOption[];
  maxSelections?: number;
  showSelectAll?: boolean;
  selectAllText?: string;
  selectedText?: (count: number) => string;
  chipVariant?: 'default' | 'secondary' | 'outline';
  allowCustomValues?: boolean;
}

// Date picker props
export interface DatePickerProps<T extends FieldValues = FieldValues>
  extends BaseFormFieldProps<T> {
  mode?: 'single' | 'multiple' | 'range';
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Date[] | ((date: Date) => boolean);
  format?: string;
  showTime?: boolean;
  timeFormat?: '12' | '24';
  locale?: string;
  clearable?: boolean;
}

// File upload props
export interface FileUploadProps<T extends FieldValues = FieldValues>
  extends BaseFormFieldProps<T> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  previewType?: 'image' | 'file' | 'none';
  uploadEndpoint?: string;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
}

// Rich text editor props
export interface RichTextEditorProps<T extends FieldValues = FieldValues>
  extends BaseFormFieldProps<T> {
  toolbar?: 'basic' | 'full' | 'minimal' | string[];
  height?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  placeholder?: string;
  uploadImages?: boolean;
  imageUploadEndpoint?: string;
}

// Form validation schema types
export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: unknown) => boolean | string;
}

// Form step/wizard types
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isOptional?: boolean;
  validate?: () => Promise<boolean>;
}

export interface WizardFormProps<T extends FieldValues = FieldValues> {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  persistence?: 'none' | 'localStorage' | 'sessionStorage';
}