import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-fixed';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Clock, MapPin, Music, Theater, Palette, Zap, Users, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { DateTimePickerStandalone } from '@/components/form/DateTimePickerStandalone';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Performance {
  name?: string;
  kind?: 'live' | 'performance' | 'instalacao' | 'intervencao' | 'teatro' | 'outro';
  starts_at?: string;
  stage?: string;
  notes?: string;
}

interface PerformanceEditorV3Props {
  value: Performance[];
  onChange: (value: Performance[]) => void;
  disabled?: boolean;
  eventStartTime?: string;
  eventEndTime?: string;
}

const performanceKinds = [
  { value: 'live', label: 'Live/Música', icon: Music, color: 'bg-purple-500' },
  { value: 'performance', label: 'Performance', icon: Theater, color: 'bg-pink-500' },
  { value: 'instalacao', label: 'Instalação', icon: Palette, color: 'bg-blue-500' },
  { value: 'intervencao', label: 'Intervenção', icon: Zap, color: 'bg-orange-500' },
  { value: 'teatro', label: 'Teatro', icon: Users, color: 'bg-green-500' },
  { value: 'outro', label: 'Outro', icon: MoreHorizontal, color: 'bg-gray-500' },
];

export const PerformanceEditorV3 = ({ 
  value, 
  onChange, 
  disabled,
  eventStartTime,
  eventEndTime
}: PerformanceEditorV3Props) => {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const addPerformance = () => {
    const newPerformance: Performance = {
      name: '',
      kind: 'performance',
      starts_at: eventStartTime,
    };
    onChange([...value, newPerformance]);
    setIsAdding(true);
    // Auto-expand the new item
    setExpandedItems(prev => new Set([...prev, value.length]));
  };

  const updatePerformance = (index: number, field: keyof Performance, newValue: any) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const removePerformance = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const duplicatePerformance = (index: number) => {
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

  const getKindInfo = (kind: Performance['kind']) => {
    return performanceKinds.find(k => k.value === kind) || performanceKinds[1];
  };

  const validateTime = (time: string, performanceIndex: number): string[] => {
    const errors: string[] = [];
    const performanceTime = new Date(time);
    
    if (eventStartTime && performanceTime < new Date(eventStartTime)) {
      errors.push('Horário deve ser após o início do evento');
    }
    
    if (eventEndTime && performanceTime > new Date(eventEndTime)) {
      errors.push('Horário deve ser antes do fim do evento');
    }

    // Check for conflicts with other performances
    value.forEach((perf, index) => {
      if (index === performanceIndex || !perf.starts_at) return;
      
      const otherTime = new Date(perf.starts_at);
      const timeDiff = Math.abs(performanceTime.getTime() - otherTime.getTime());
      
      if (timeDiff < 15 * 60 * 1000) { // 15 minutes
        errors.push(`Conflito com "${perf.name}" (muito próximo)`);
      }
    });

    return errors;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Performances Cênicas</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Organize as apresentações, horários e locais das performances
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPerformance}
          disabled={disabled}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Performance
        </Button>
      </div>

      {value.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-8">
            <Theater className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma performance adicionada</p>
            <p className="text-xs text-muted-foreground">Clique em "Adicionar Performance" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="performances">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {value.map((performance, index) => {
                  const kindInfo = getKindInfo(performance.kind);
                  const isExpanded = expandedItems.has(index);
                  const timeErrors = performance.starts_at ? validateTime(performance.starts_at, index) : [];
                  
                  return (
                    <Draggable key={index} draggableId={`performance-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative transition-all ${
                            snapshot.isDragging ? 'shadow-lg scale-105' : ''
                          } ${timeErrors.length > 0 ? 'border-destructive' : ''}`}
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
                                
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded ${kindInfo.color}`}></div>
                                  <CardTitle className="text-base">
                                    {performance.name || `Performance #${index + 1}`}
                                  </CardTitle>
                                </div>
                                
                                <Badge variant="secondary" className="text-xs">
                                  {kindInfo.label}
                                </Badge>
                                
                                {performance.starts_at && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(performance.starts_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                                
                                {performance.stage && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {performance.stage}
                                  </div>
                                )}
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
                                  onClick={() => duplicatePerformance(index)}
                                  disabled={disabled}
                                  className="h-8 w-8 p-0"
                                  title="Duplicar performance"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePerformance(index)}
                                  disabled={disabled}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {timeErrors.length > 0 && (
                              <div className="mt-2">
                                {timeErrors.map((error, i) => (
                                  <p key={i} className="text-xs text-destructive">⚠️ {error}</p>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                          
                          {isExpanded && (
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`performance-name-${index}`}>Nome*</Label>
                                  <Input
                                    id={`performance-name-${index}`}
                                    value={performance.name}
                                    onChange={(e) => updatePerformance(index, 'name', e.target.value)}
                                    placeholder="Nome da performance..."
                                    disabled={disabled}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`performance-kind-${index}`}>Tipo</Label>
                                  <Select
                                    value={performance.kind}
                                    onValueChange={(value) => updatePerformance(index, 'kind', value)}
                                    disabled={disabled}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                                      {performanceKinds.map((kind) => {
                                        const IconComponent = kind.icon;
                                        return (
                                          <SelectItem key={kind.value} value={kind.value}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className="h-4 w-4" />
                                              {kind.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`performance-stage-${index}`}>Palco/Local</Label>
                                  <Input
                                    id={`performance-stage-${index}`}
                                    value={performance.stage || ''}
                                    onChange={(e) => updatePerformance(index, 'stage', e.target.value)}
                                    placeholder="Palco principal, sala 2..."
                                    disabled={disabled}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`performance-time-${index}`}>Horário</Label>
                                  <DateTimePickerStandalone
                                    id={`performance-time-${index}`}
                                    value={performance.starts_at ? new Date(performance.starts_at) : undefined}
                                    onChange={(date) => updatePerformance(index, 'starts_at', date?.toISOString())}
                                    disabled={disabled}
                                    placeholder="Selecione horário da performance..."
                                  />
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-2">
                                <Label htmlFor={`performance-notes-${index}`}>Observações</Label>
                                <Textarea
                                  id={`performance-notes-${index}`}
                                  value={performance.notes || ''}
                                  onChange={(e) => updatePerformance(index, 'notes', e.target.value)}
                                  placeholder="Informações adicionais sobre a performance..."
                                  disabled={disabled}
                                  rows={3}
                                />
                              </div>
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