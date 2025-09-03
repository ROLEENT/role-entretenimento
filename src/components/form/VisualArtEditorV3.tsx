import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, ExternalLink, User, Palette, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface VisualArtist {
  name?: string;
  work?: string;
  portfolio_url?: string;
}

interface VisualArtEditorV3Props {
  value: VisualArtist[];
  onChange: (value: VisualArtist[]) => void;
  disabled?: boolean;
}

export const VisualArtEditorV3 = ({ value, onChange, disabled }: VisualArtEditorV3Props) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const addArtist = () => {
    const newArtist: VisualArtist = {
      name: '',
    };
    onChange([...value, newArtist]);
    // Auto-expand the new item
    setExpandedItems(prev => new Set([...prev, value.length]));
  };

  const updateArtist = (index: number, field: keyof VisualArtist, newValue: string) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const removeArtist = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const duplicateArtist = (index: number) => {
    const original = value[index];
    const duplicated = {
      ...original,
      name: `${original.name} (cópia)`,
    };
    const newValue = [...value];
    newValue.splice(index + 1, 0, duplicated);
    onChange(newValue);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || disabled) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onChange(items);
  };

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getArtistInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Artistas Visuais</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione os artistas visuais participantes e seus portfólios
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addArtist}
          disabled={disabled}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Artista Visual
        </Button>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-8">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum artista visual adicionado</p>
            <p className="text-xs text-muted-foreground">Clique em "Adicionar Artista Visual" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="visual-artists">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {value.map((artist, index) => {
                  const isExpanded = expandedItems.has(index);
                  const hasPortfolio = artist.portfolio_url && isValidUrl(artist.portfolio_url);
                  
                  return (
                    <Draggable key={index} draggableId={`artist-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative transition-all ${
                            snapshot.isDragging ? 'shadow-lg scale-105' : ''
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
                                >
                                  <div className="flex flex-col gap-1">
                                    <div className="w-3 h-0.5 bg-muted-foreground rounded"></div>
                                    <div className="w-3 h-0.5 bg-muted-foreground rounded"></div>
                                    <div className="w-3 h-0.5 bg-muted-foreground rounded"></div>
                                  </div>
                                </div>
                                
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {artist.name ? getArtistInitials(artist.name) : <User className="h-4 w-4" />}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">
                                    {artist.name || `Artista Visual #${index + 1}`}
                                  </CardTitle>
                                  
                                  {artist.work && (
                                    <Badge variant="outline" className="text-xs">
                                      {artist.work}
                                    </Badge>
                                  )}
                                  
                                  {hasPortfolio && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(artist.portfolio_url, '_blank')}
                                      className="h-6 w-6 p-0"
                                      title="Ver portfólio"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateArtist(index)}
                                  disabled={disabled}
                                  className="h-8 w-8 p-0"
                                  title="Duplicar artista"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeArtist(index)}
                                  disabled={disabled}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {isExpanded && (
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`artist-name-${index}`}>Nome*</Label>
                                  <Input
                                    id={`artist-name-${index}`}
                                    value={artist.name}
                                    onChange={(e) => updateArtist(index, 'name', e.target.value)}
                                    placeholder="Nome do artista visual..."
                                    disabled={disabled}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`artist-work-${index}`}>Obra/Projeto</Label>
                                  <Input
                                    id={`artist-work-${index}`}
                                    value={artist.work || ''}
                                    onChange={(e) => updateArtist(index, 'work', e.target.value)}
                                    placeholder="Nome da obra ou projeto..."
                                    disabled={disabled}
                                  />
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-2">
                                <Label htmlFor={`artist-portfolio-${index}`}>URL do Portfólio</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id={`artist-portfolio-${index}`}
                                    type="url"
                                    value={artist.portfolio_url || ''}
                                    onChange={(e) => updateArtist(index, 'portfolio_url', e.target.value)}
                                    placeholder="https://artista.com.br"
                                    disabled={disabled}
                                    className={artist.portfolio_url && !isValidUrl(artist.portfolio_url) ? 'border-destructive' : ''}
                                  />
                                  {hasPortfolio && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(artist.portfolio_url, '_blank')}
                                      className="px-3"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                {artist.portfolio_url && !isValidUrl(artist.portfolio_url) && (
                                  <p className="text-xs text-destructive">URL inválida</p>
                                )}
                              </div>

                              {hasPortfolio && (
                                <div className="rounded-lg border p-4 bg-muted/30">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Portfólio disponível para visualização</span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};