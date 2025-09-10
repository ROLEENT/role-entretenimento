import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateSlugFromName } from '@/lib/generateSlug';

interface SlugGeneratorProps {
  onGenerate: (slug: string) => void;
  label?: string;
}

export const SlugGenerator: React.FC<SlugGeneratorProps> = ({
  onGenerate,
  label = "Gerar slug"
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleGenerate = () => {
    if (inputValue.trim()) {
      const slug = generateSlugFromName(inputValue);
      onGenerate(slug);
      setInputValue('');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Digite o texto para gerar slug"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleGenerate();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={!inputValue.trim()}
      >
        {label}
      </Button>
    </div>
  );
};