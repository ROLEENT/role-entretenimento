import { useState } from "react";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AgentesTagsInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxTags?: number;
}

export function AgentesTagsInput({ 
  name = "tags", 
  label = "Tags",
  placeholder = "Digite uma tag e pressione Enter",
  maxTags = 12 
}: AgentesTagsInputProps) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  
  const tags: string[] = watch(name) || [];
  const error = errors[name]?.message as string;

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (tags.includes(trimmedTag)) {
      return; // Tag já existe
    }
    
    if (tags.length >= maxTags) {
      return; // Máximo de tags atingido
    }
    
    setValue(name, [...tags, trimmedTag], { shouldValidate: true });
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    setValue(name, tags.filter(tag => tag !== tagToRemove), { shouldValidate: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove última tag se input estiver vazio
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      
      <div className="min-h-[2.5rem] p-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        <Input
          id={name}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? `Máximo ${maxTags} tags` : placeholder}
          disabled={tags.length >= maxTags}
          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{tags.length}/{maxTags} tags</span>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}