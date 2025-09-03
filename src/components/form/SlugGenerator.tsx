import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { generateSlug } from '@/utils/slugUtils';

interface SlugGeneratorProps {
  title: string;
  onGenerate: (slug: string) => void;
  disabled?: boolean;
}

export const SlugGenerator = ({ title, onGenerate, disabled }: SlugGeneratorProps) => {
  const handleGenerate = () => {
    if (title.trim()) {
      const newSlug = generateSlug(title);
      onGenerate(newSlug);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || !title.trim()}
      className="flex items-center gap-2"
    >
      <Wand2 className="h-4 w-4" />
      Gerar do título
    </Button>
  );
};