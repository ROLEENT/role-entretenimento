import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";
import { TAG_CATEGORIES, type TagKey } from "@/types/curatorial-tags";
import { TagBadge } from "./TagBadge";

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[]; // Tags que estão disponíveis nos dados atuais
}

export function TagFilter({ selectedTags, onTagsChange, availableTags }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tagKey: string, checked: boolean) => {
    if (checked) {
      onTagsChange([...selectedTags, tagKey]);
    } else {
      onTagsChange(selectedTags.filter(tag => tag !== tagKey));
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const hasSelectedTags = selectedTags.length > 0;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar por tags
            {hasSelectedTags && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filtrar por tags</h4>
              {hasSelectedTags && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllTags}
                  className="h-auto p-1 text-xs"
                >
                  Limpar tudo
                </Button>
              )}
            </div>

            {/* Tags selecionadas */}
            {hasSelectedTags && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Selecionadas:</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1">
                      <TagBadge tag={tag} size="sm" showTooltip={false} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleTagToggle(tag, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Categorias de filtro */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => {
                const categoryTags = Object.keys(category.tags);
                const availableInCategory = availableTags 
                  ? categoryTags.filter(tag => availableTags.includes(tag))
                  : categoryTags;

                if (availableInCategory.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {category.label}
                    </Label>
                    <div className="space-y-2">
                      {availableInCategory.map((tagKey) => {
                        const tagInfo = (category.tags as any)[tagKey];
                        if (!tagInfo) return null;
                        
                        return (
                          <div key={tagKey} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-${tagKey}`}
                              checked={selectedTags.includes(tagKey)}
                              onCheckedChange={(checked) => 
                                handleTagToggle(tagKey, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`filter-${tagKey}`}
                              className="text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>{tagInfo.icon}</span>
                              {tagInfo.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags selecionadas inline */}
      {hasSelectedTags && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedTags.slice(0, 3).map((tag) => (
            <TagBadge 
              key={tag} 
              tag={tag} 
              size="sm" 
              showTooltip={false}
              className="cursor-pointer"
            />
          ))}
          {selectedTags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedTags.length - 3} mais
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}