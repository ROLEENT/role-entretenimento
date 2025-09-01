import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { OrganizerFlexibleForm } from '@/schemas/agents-flexible';

interface OrganizerMediaTabProps {
  form: UseFormReturn<OrganizerFlexibleForm>;
}

export const OrganizerMediaTab: React.FC<OrganizerMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Logo</h3>
        
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Logo do Organizador"
                  maxSizeMB={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};