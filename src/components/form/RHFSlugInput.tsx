import React from 'react';
import { useController, FieldPath, FieldValues } from 'react-hook-form';
import { SlugInput } from './SlugInput';

interface RHFSlugInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  locked?: boolean;
  required?: boolean;
  className?: string;
  statusIcon?: React.ReactNode;
  onRegenerate?: () => void;
  onEdit?: () => void;
  regenerateDisabled?: boolean;
}

export function RHFSlugInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder,
  description,
  disabled,
  locked,
  required,
  className,
  statusIcon,
  onRegenerate,
  onEdit,
  regenerateDisabled,
}: RHFSlugInputProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name });

  return (
    <SlugInput
      id={name}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      onRegenerate={onRegenerate}
      onEdit={onEdit}
      error={error?.message}
      disabled={disabled}
      locked={locked}
      required={required}
      className={className}
      statusIcon={statusIcon}
      regenerateDisabled={regenerateDisabled}
    />
  );
}