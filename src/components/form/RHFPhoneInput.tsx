import React from 'react';
import { useController, FieldPath, FieldValues } from 'react-hook-form';
import { PhoneInput } from './PhoneInput';

interface RHFPhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function RHFPhoneInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder,
  disabled,
  required,
  className,
}: RHFPhoneInputProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name });

  return (
    <PhoneInput
      id={name}
      name={name}
      label={label}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      error={error?.message}
      disabled={disabled}
      required={required}
      className={className}
    />
  );
}