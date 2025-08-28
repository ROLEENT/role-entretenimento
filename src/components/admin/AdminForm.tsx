import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'file' | 'array' | 'email' | 'url' | 'number' | 'datetime-local';
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  section?: string;
  bucket?: string; // For file uploads
  maxSize?: number; // For file uploads
  allowedTypes?: string[]; // For file uploads
  className?: string;
  rows?: number; // For textarea
  min?: number; // For numbers
  max?: number; // For numbers
}

interface FormSection {
  title: string;
  description?: string;
  fields: string[];
}

interface AdminFormProps {
  title: string;
  description?: string;
  schema: z.ZodSchema;
  fields: FormField[];
  sections?: FormSection[];
  defaultValues?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isEdit?: boolean;
  adminEmail?: string;
}

export function AdminForm({
  title,
  description,
  schema,
  fields,
  sections = [],
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  isLoading = false,
  isEdit = false,
  adminEmail
}: AdminFormProps) {
  const navigate = useNavigate();
  const [dynamicArrays, setDynamicArrays] = useState<Record<string, string[]>>({});

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      ...fields.reduce((acc, field) => {
        if (field.type === 'array' && defaultValues[field.name]) {
          setDynamicArrays(prev => ({
            ...prev,
            [field.name]: defaultValues[field.name] || []
          }));
        }
        return acc;
      }, {})
    }
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const addToArray = (fieldName: string) => {
    setDynamicArrays(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), '']
    }));
  };

  const removeFromArray = (fieldName: string, index: number) => {
    setDynamicArrays(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || []
    }));
    
    const currentValues = form.getValues(fieldName) || [];
    const newValues = currentValues.filter((_: any, i: number) => i !== index);
    form.setValue(fieldName, newValues);
  };

  const updateArrayItem = (fieldName: string, index: number, value: string) => {
    const currentValues = form.getValues(fieldName) || [];
    const newValues = [...currentValues];
    newValues[index] = value;
    form.setValue(fieldName, newValues);
  };

  const renderField = (field: FormField) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === 'text' && (
                <Input
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  {...formField}
                />
              )}
              {field.type === 'email' && (
                <Input
                  type="email"
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  {...formField}
                />
              )}
              {field.type === 'url' && (
                <Input
                  type="url"
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  {...formField}
                />
              )}
               {field.type === 'number' && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  min={field.min}
                  max={field.max}
                  {...formField}
                  onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
              {field.type === 'datetime-local' && (
                <Input
                  type="datetime-local"
                  disabled={field.disabled}
                  {...formField}
                />
              )}
              {field.type === 'textarea' && (
                <Textarea
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  rows={field.rows || 4}
                  {...formField}
                />
              )}
               {field.type === 'select' && (
                <Select
                  disabled={field.disabled}
                  onValueChange={formField.onChange}
                  value={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === 'multiselect' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formField.value || []).map((selectedValue: string) => {
                      const option = field.options?.find(opt => opt.value === selectedValue);
                      return (
                        <Badge
                          key={selectedValue}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            const newValue = (formField.value || []).filter((v: string) => v !== selectedValue);
                            formField.onChange(newValue);
                          }}
                        >
                          {option?.label} ×
                        </Badge>
                      );
                    })}
                  </div>
                  <Select
                    disabled={field.disabled}
                    onValueChange={(value) => {
                      const currentValues = formField.value || [];
                      if (!currentValues.includes(value)) {
                        formField.onChange([...currentValues, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Selecionar ${field.label.toLowerCase()}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.filter(option => !(formField.value || []).includes(option.value)).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={field.disabled}
                  />
                  <span className="text-sm">{field.description}</span>
                </div>
              )}
              {field.type === 'file' && (
                <AdminFileUpload
                  bucket={(field.bucket as 'events' | 'venues' | 'organizers' | 'posts' | 'highlights' | 'artists') || 'highlights'}
                  onUploadComplete={(url) => formField.onChange(url)}
                  currentUrl={formField.value}
                  label={field.label}
                  maxSize={field.maxSize}
                  allowedTypes={field.allowedTypes}
                  adminEmail={adminEmail}
                />
              )}
              {field.type === 'array' && (
                <div className="space-y-2">
                  {(dynamicArrays[field.name] || []).map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={field.placeholder}
                        value={form.getValues(`${field.name}.${index}`) || ''}
                        onChange={(e) => updateArrayItem(field.name, index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromArray(field.name, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addToArray(field.name)}
                  >
                    Adicionar {field.label}
                  </Button>
                </div>
              )}
            </FormControl>
            {field.description && field.type !== 'checkbox' && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const fieldsToRender = sections.length > 0 
    ? sections.flatMap(section => section.fields)
    : fields.map(f => f.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {sections.length > 0 ? (
            sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((fieldName) => {
                    const field = fields.find(f => f.name === fieldName);
                    return field ? renderField(field) : null;
                  })}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="space-y-4 pt-6">
                {fields.map(renderField)}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}