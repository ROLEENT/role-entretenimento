import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistContactTabProps {
  form: UseFormReturn<ArtistFormData>;
}

const BRAZIL_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const ArtistContactTab: React.FC<ArtistContactTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Personal Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contato Pessoal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Pessoal</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="artista@email.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="@artistaincrivel" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Booking Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contato para Booking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="booking_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de Booking</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="booking@empresa.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp de Booking</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone de Booking</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Localização</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade Atual</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="São Paulo" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRAZIL_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="home_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade de Origem</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Cidade natal" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brasil" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Redes Sociais e Website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://www.artistaincrivel.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="spotify_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spotify</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://open.spotify.com/artist/..." 
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
                <FormLabel>SoundCloud</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://soundcloud.com/artista" 
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
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://youtube.com/@artista" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="beatport_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beatport</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://beatport.com/artist/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audius_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audius</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://audius.co/artista" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};