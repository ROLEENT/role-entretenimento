import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Music, 
  Clock, 
  Star, 
  Mic, 
  Users, 
  Palette,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ComboboxAsync } from '@/components/ui/combobox-async';
import { useEntityLookup } from '@/hooks/useEntityLookup';
import { TicketRulesSection } from './TicketRulesSection';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// Drag and drop functionality (simplified)
const DragHandle: React.FC<{ onMoveUp: () => void; onMoveDown: () => void; canMoveUp: boolean; canMoveDown: boolean }> = ({ 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}) => (
  <div className="flex flex-col gap-1">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveUp}
      disabled={!canMoveUp}
      className="h-6 w-6 p-0"
    >
      <ChevronUp className="h-3 w-3" />
    </Button>
    <GripVertical className="h-4 w-4 text-muted-foreground" />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveDown}
      disabled={!canMoveDown}
      className="h-6 w-6 p-0"
    >
      <ChevronDown className="h-3 w-3" />
    </Button>
  </div>
);

// Artist Slot Manager Component
interface ArtistSlotManagerProps {
  control: any;
  slotIndex: number;
  searchArtists: (query: string) => Promise<any[]>;
}

const ArtistSlotManager: React.FC<ArtistSlotManagerProps> = ({ control, slotIndex, searchArtists }) => {
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const {
    fields: artists,
    append: appendArtist,
    remove: removeArtist,
    move: moveArtist
  } = useFieldArray({
    control,
    name: `lineup_slots.${slotIndex}.artists`
  });

  const handleArtistSelect = async (artistId: string | undefined) => {
    if (!artistId) {
      setSelectedArtistId('');
      return;
    }

    // Check if artist is already in this slot
    const existingArtist = artists.find((artist: any) => artist.artist_id === artistId);
    if (existingArtist) {
      setSelectedArtistId('');
      return;
    }

    try {
      // Get artist by ID - we need to search to get the name
      const searchResults = await searchArtists('');
      const selectedArtist = searchResults.find(artist => artist.value === artistId);
      
      if (selectedArtist) {
        appendArtist({
          artist_id: selectedArtist.value,
          artist_name: selectedArtist.name,
          position: artists.length,
          role: 'performer'
        });
      } else {
        // Fallback: add with ID only and allow manual name entry
        appendArtist({
          artist_id: artistId,
          artist_name: `Artista ${artistId.slice(0, 8)}...`,
          position: artists.length,
          role: 'performer'
        });
      }
    } catch (error) {
      console.error('Error adding artist:', error);
      // Fallback: add with ID only
      appendArtist({
        artist_id: artistId,
        artist_name: `Artista ${artistId.slice(0, 8)}...`,
        position: artists.length,
        role: 'performer'
      });
    }
    
    setSelectedArtistId('');
  };

  return (
    <div className="space-y-3">
      <FormLabel>Artistas neste slot</FormLabel>
      
      {/* Add artist combobox */}
      <div className="space-y-2">
        <ComboboxAsync
          placeholder="Buscar e adicionar artista..."
          emptyText="Nenhum artista encontrado"
          onSearch={searchArtists}
          onValueChange={handleArtistSelect}
          value={selectedArtistId}
        />
      </div>

      {/* List of selected artists */}
      {artists.length > 0 && (
        <div className="space-y-2">
          {artists.map((artist, artistIndex) => (
            <div key={artist.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <DragHandle
                  onMoveUp={() => moveArtist(artistIndex, artistIndex - 1)}
                  onMoveDown={() => moveArtist(artistIndex, artistIndex + 1)}
                  canMoveUp={artistIndex > 0}
                  canMoveDown={artistIndex < artists.length - 1}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{(artist as any).artist_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(artist as any).role || 'performer'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`lineup_slots.${slotIndex}.artists.${artistIndex}.role`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performer">Performer</SelectItem>
                        <SelectItem value="headliner">Headliner</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="special-guest">Convidado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArtist(artistIndex)}
                  className="text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {artists.length === 0 && (
        <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg text-center">
          Nenhum artista adicionado neste slot
        </div>
      )}
    </div>
  );
};

export const LineupStep: React.FC = () => {
  const { control, watch } = useFormContext<EventFormData>();
  const [activeTab, setActiveTab] = useState('lineup');
  
  const { searchEntities: searchArtists } = useEntityLookup({ type: 'artists' });

  // Lineup Slots
  const {
    fields: lineupSlots,
    append: appendLineupSlot,
    remove: removeLineupSlot,
    move: moveLineupSlot
  } = useFieldArray({
    control,
    name: 'lineup_slots'
  });

  // Performances
  const {
    fields: performances,
    append: appendPerformance,
    remove: removePerformance,
    move: movePerformance
  } = useFieldArray({
    control,
    name: 'performances'
  });

  // Visual Artists
  const {
    fields: visualArtists,
    append: appendVisualArtist,
    remove: removeVisualArtist,
    move: moveVisualArtist
  } = useFieldArray({
    control,
    name: 'visual_artists'
  });

  const addLineupSlot = () => {
    appendLineupSlot({
      slot_name: '',
      start_time: '',
      end_time: '',
      stage: '',
      position: lineupSlots.length,
      is_headliner: false,
      notes: '',
      artists: []
    });
  };

  const addPerformance = () => {
    appendPerformance({
      performer_name: '',
      performance_type: '',
      description: '',
      start_time: '',
      duration_minutes: 60,
      stage: '',
      position: performances.length,
      contact_info: {}
    });
  };

  const addVisualArtist = () => {
    appendVisualArtist({
      artist_name: '',
      art_type: '',
      description: '',
      installation_location: '',
      contact_info: {},
      artwork_images: [],
      position: visualArtists.length
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lineup" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Lineup Musical
          </TabsTrigger>
          <TabsTrigger value="performances" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Performances
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Arte Visual
          </TabsTrigger>
        </TabsList>

        {/* Lineup Musical */}
        <TabsContent value="lineup" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Lineup Musical</h3>
              <p className="text-sm text-muted-foreground">
                Organize os artistas por slots de horário
              </p>
            </div>
            <Button onClick={addLineupSlot} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Slot
            </Button>
          </div>

          {lineupSlots.map((slot, slotIndex) => (
            <Card key={slot.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <DragHandle
                      onMoveUp={() => moveLineupSlot(slotIndex, slotIndex - 1)}
                      onMoveDown={() => moveLineupSlot(slotIndex, slotIndex + 1)}
                      canMoveUp={slotIndex > 0}
                      canMoveDown={slotIndex < lineupSlots.length - 1}
                    />
                    <div className="space-y-1">
                      <FormField
                        control={control}
                        name={`lineup_slots.${slotIndex}.slot_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Nome do slot (ex: Abertura, Main Stage, etc.)"
                                {...field}
                                className="font-medium"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`lineup_slots.${slotIndex}.is_headliner`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Headliner</FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineupSlot(slotIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name={`lineup_slots.${slotIndex}.start_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`lineup_slots.${slotIndex}.end_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`lineup_slots.${slotIndex}.stage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palco</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do palco"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`lineup_slots.${slotIndex}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre este slot"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Artists in this slot */}
                <ArtistSlotManager
                  control={control}
                  slotIndex={slotIndex}
                  searchArtists={searchArtists}
                />
              </CardContent>
            </Card>
          ))}

          {lineupSlots.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum slot de lineup</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione slots para organizar os artistas por horário
                </p>
                <Button onClick={addLineupSlot}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Slot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performances */}
        <TabsContent value="performances" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Performances Especiais</h3>
              <p className="text-sm text-muted-foreground">
                Shows, apresentações e performances complementares
              </p>
            </div>
            <Button onClick={addPerformance} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Performance
            </Button>
          </div>

          {performances.map((performance, performanceIndex) => (
            <Card key={performance.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Performance #{performanceIndex + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <DragHandle
                      onMoveUp={() => movePerformance(performanceIndex, performanceIndex - 1)}
                      onMoveDown={() => movePerformance(performanceIndex, performanceIndex + 1)}
                      canMoveUp={performanceIndex > 0}
                      canMoveDown={performanceIndex < performances.length - 1}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerformance(performanceIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`performances.${performanceIndex}.performer_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Performer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do artista/grupo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`performances.${performanceIndex}.performance_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Performance</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dj-set">DJ Set</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="showcase">Showcase</SelectItem>
                            <SelectItem value="b2b">B2B</SelectItem>
                            <SelectItem value="teatro">Teatro</SelectItem>
                            <SelectItem value="danca">Dança</SelectItem>
                            <SelectItem value="poetry">Poetry</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`performances.${performanceIndex}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição da performance..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name={`performances.${performanceIndex}.start_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`performances.${performanceIndex}.duration_minutes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`performances.${performanceIndex}.stage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palco</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do palco"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {performances.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mic className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma performance</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione performances especiais como shows, teatro, dança
                </p>
                <Button onClick={addPerformance}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Performance
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visual Artists */}
        <TabsContent value="visual" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Arte Visual</h3>
              <p className="text-sm text-muted-foreground">
                Instalações, intervenções e artes visuais
              </p>
            </div>
            <Button onClick={addVisualArtist} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Artista Visual
            </Button>
          </div>

          {visualArtists.map((artist, artistIndex) => (
            <Card key={artist.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Artista Visual #{artistIndex + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <DragHandle
                      onMoveUp={() => moveVisualArtist(artistIndex, artistIndex - 1)}
                      onMoveDown={() => moveVisualArtist(artistIndex, artistIndex + 1)}
                      canMoveUp={artistIndex > 0}
                      canMoveDown={artistIndex < visualArtists.length - 1}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVisualArtist(artistIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`visual_artists.${artistIndex}.artist_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Artista</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do artista visual"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`visual_artists.${artistIndex}.art_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Arte</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instalacao">Instalação</SelectItem>
                            <SelectItem value="graffiti">Graffiti</SelectItem>
                            <SelectItem value="projecao">Projeção</SelectItem>
                            <SelectItem value="escultura">Escultura</SelectItem>
                            <SelectItem value="pintura">Pintura</SelectItem>
                            <SelectItem value="intervencao">Intervenção</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`visual_artists.${artistIndex}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Obra</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição da instalação ou obra..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`visual_artists.${artistIndex}.installation_location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local da Instalação</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Onde a obra estará localizada"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          {visualArtists.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma arte visual</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione instalações, intervenções e artes visuais
                </p>
                <Button onClick={addVisualArtist}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Artista Visual
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};