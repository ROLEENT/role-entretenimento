import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { TagBadge } from "./TagBadge";
import { TAG_CATEGORIES, type TagKey } from "@/types/curatorial-tags";

interface EventTransparencyProps {
  tags: string[];
  className?: string;
  showTitle?: boolean;
}

export function EventTransparency({ tags, className, showTitle = true }: EventTransparencyProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Organizar tags por categoria
  const categorizedTags = {
    origin: tags.filter(tag => tag in TAG_CATEGORIES.origin.tags),
    quality: tags.filter(tag => tag in TAG_CATEGORIES.quality.tags),
    curatorial: tags.filter(tag => tag in TAG_CATEGORIES.curatorial.tags),
    other: tags.filter(tag => 
      !(tag in TAG_CATEGORIES.origin.tags) &&
      !(tag in TAG_CATEGORIES.quality.tags) &&
      !(tag in TAG_CATEGORIES.curatorial.tags)
    )
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        {showTitle && (
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" />
            Como descobrimos este evento
          </CardTitle>
        )}
        <CardDescription className="text-sm">
          Transparência sobre nossa curadoria e seleção de eventos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags de origem */}
        {categorizedTags.origin.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Origem
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorizedTags.origin.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Tags de qualidade */}
        {categorizedTags.quality.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Verificação
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorizedTags.quality.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Tags curatoriais */}
        {categorizedTags.curatorial.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Critérios Curatoriais
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorizedTags.curatorial.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Tags não categorizadas */}
        {categorizedTags.other.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Outras Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorizedTags.other.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Explicação adicional */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Estas tags nos ajudam a manter transparência sobre como selecionamos 
            e verificamos os eventos da nossa agenda cultural.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}