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
  suggestions?: string[];
}

export const AgentesTagsInput: React.FC<AgentesTagsInputProps> = ({
  name,
  label,
  placeholder = "Digite uma tag e pressione Enter",
  maxTags = 10,
  suggestions = []
}) => {
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
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Filtrar sugestões baseadas no input atual
  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(suggestion)
  ).slice(0, 5); // Mostrar no máximo 5 sugestões

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
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
          disabled={tags.length >= maxTags}
        />
      </div>

      {/* Sugestões */}
      {inputValue && filteredSuggestions.length > 0 && (
        <div className="mt-2 border border-border rounded-md bg-background shadow-sm">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>{tags.length}/{maxTags} tags</span>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
};