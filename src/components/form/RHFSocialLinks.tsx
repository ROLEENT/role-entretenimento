import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Globe, Facebook, Linkedin, Youtube, Twitter } from 'lucide-react';

interface RHFSocialLinksProps {
  namePrefix?: string;
  label?: string;
  showInstagram?: boolean;
  showWebsite?: boolean;
  showFacebook?: boolean;
  showLinkedin?: boolean;
  showYoutube?: boolean;
  showTwitter?: boolean;
  variant?: 'card' | 'inline';
  className?: string;
}

export const RHFSocialLinks: React.FC<RHFSocialLinksProps> = ({
  namePrefix = 'links',
  label = "Links Sociais",
  showInstagram = true,
  showWebsite = true,
  showFacebook = true,
  showLinkedin = true,
  showYoutube = true,
  showTwitter = true,
  variant = 'card',
  className,
}) => {
  const { control } = useFormContext();

  const socialFields = [
    {
      key: 'instagram',
      label: 'Instagram',
      placeholder: '@usuario ou https://instagram.com/usuario',
      icon: Instagram,
      show: showInstagram,
    },
    {
      key: 'website',
      label: 'Website',
      placeholder: 'https://www.exemplo.com',
      icon: Globe,
      show: showWebsite,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      placeholder: 'https://facebook.com/usuario',
      icon: Facebook,
      show: showFacebook,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/usuario',
      icon: Linkedin,
      show: showLinkedin,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      placeholder: 'https://youtube.com/usuario',
      icon: Youtube,
      show: showYoutube,
    },
    {
      key: 'twitter',
      label: 'Twitter',
      placeholder: 'https://twitter.com/usuario',
      icon: Twitter,
      show: showTwitter,
    },
  ].filter(field => field.show);

  const renderFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {socialFields.map((field) => (
        <FormField
          key={field.key}
          control={control}
          name={`${namePrefix}.${field.key}`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <field.icon className="h-4 w-4" />
                {field.label}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={field.placeholder}
                  {...formField}
                  value={formField.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={className}>
        {label && <h3 className="text-lg font-medium mb-4">{label}</h3>}
        {renderFields()}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderFields()}
      </CardContent>
    </Card>
  );
};