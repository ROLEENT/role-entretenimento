import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { TAG_CATEGORIES, validateTags, type TagKey } from "@/types/curatorial-tags";
import { TagBadge } from "./TagBadge";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  error?: string;
}

export function TagSelector({ selectedTags, onTagsChange, error }: TagSelectorProps) {
  const [localTags, setLocalTags] = useState<Set<string>>(new Set(selectedTags));

  const handleTagToggle = (tagKey: string, checked: boolean) => {
    const newTags = new Set(localTags);
    
    if (checked) {
      newTags.add(tagKey);
    } else {
      newTags.delete(tagKey);
    }
    
    setLocalTags(newTags);
    onTagsChange(Array.from(newTags));
  };

  const validation = validateTags(Array.from(localTags));

  return (
    <div className="space-y-6">
      {/* Preview das tags selecionadas */}
      {localTags.size > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tags Selecionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(localTags).map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validação */}
      {!validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {validation.errors.join(". ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Erro externo */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categorias de tags */}
      {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => (
        <Card key={categoryKey}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">
                {category.label}
                {category.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              {category.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(category.tags).map(([tagKey, tagInfo]) => (
                <div key={tagKey} className="flex items-start space-x-3">
                  <Checkbox
                    id={tagKey}
                    checked={localTags.has(tagKey)}
                    onCheckedChange={(checked) => 
                      handleTagToggle(tagKey, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor={tagKey}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <span className="text-base" role="img" aria-label={tagInfo.label}>
                        {tagInfo.icon}
                      </span>
                      {tagInfo.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {tagInfo.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}