import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProfile } from '../../schemas';
import { TagSelector } from '../TagSelector';
import { Music, DollarSign, Briefcase, MapPin, FileText, ExternalLink } from 'lucide-react';

interface ArtistFieldsProps {
  form: UseFormReturn<CreateProfile>;
}

const musicGenres = [
  'House', 'Deep House', 'Tech House', 'Progressive House', 'Future House',
  'Techno', 'Minimal Techno', 'Progressive Techno', 'Industrial Techno',
  'Trance', 'Progressive Trance', 'Uplifting Trance', 'Psytrance',
  'Electro', 'Electro House', 'Big Room', 'Festival',
  'Drum & Bass', 'Liquid DNB', 'Neurofunk', 'Jump Up',
  'Dubstep', 'Future Bass', 'Trap', 'Bass Music',
  'Breaks', 'Breakbeat', 'UK Garage', 'Speed Garage',
  'Ambient', 'Downtempo', 'Chillout', 'Lo-Fi',
  'Disco', 'Nu Disco', 'Funk', 'Indie Dance',
  'Hip Hop', 'Rap', 'R&B', 'Soul',
  'Pop', 'Electronic Pop', 'Synthpop', 'Indie Pop',
  'Rock', 'Electronic Rock', 'Alternative', 'Indie',
  'Jazz', 'Jazz Fusion', 'Smooth Jazz', 'Acid Jazz',
  'Reggae', 'Dub', 'Dancehall', 'Ska',
  'Latin', 'Reggaeton', 'Bachata', 'Salsa', 'Bossa Nova',
  'World Music', 'Afrobeat', 'Tribal', 'Ethnic',
  'Experimental', 'IDM', 'Glitch', 'Noise', 'Avant-garde'
];

export function ArtistFields({ form }: ArtistFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Musical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Informações Musicais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="genres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gêneros Musicais *</FormLabel>
                <FormControl>
                  <TagSelector
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Adicione gêneros musicais..."
                    suggestions={musicGenres}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pronoun"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pronomes</FormLabel>
                <FormControl>
                  <Input placeholder="ele/dele, ela/dela, elu/delu..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="agency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agência/Selo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da agência ou selo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="touring_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade base para turnês</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade de onde partem as turnês..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fee_band"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de cachê (informação privada)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa de cachê" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="<=2k">Até R$ 2.000</SelectItem>
                    <SelectItem value="2-5k">R$ 2.000 - R$ 5.000</SelectItem>
                    <SelectItem value="5-10k">R$ 5.000 - R$ 10.000</SelectItem>
                    <SelectItem value="10k+">Acima de R$ 10.000</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Rider Técnico e Material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="rider_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Rider Técnico</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stageplot_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Stage Plot</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="presskit_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Press Kit</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Streaming Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Plataformas de Streaming
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="spotify_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do Spotify</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Spotify Artist ID (apenas o ID, não a URL completa)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soundcloud_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do SoundCloud</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://soundcloud.com/seuusuario" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtube_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do YouTube</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://youtube.com/channel/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}