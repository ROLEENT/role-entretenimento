import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RHFInput, RHFURLInput, RHFSocialLinks } from '@/components/form';
import { ArtistFlexibleForm } from '@/schemas/agents-flexible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ArtistContactTabProps {
  form: UseFormReturn<ArtistFlexibleForm>;
}

export const ArtistContactTab: React.FC<ArtistContactTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contato Geral</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="email"
            type="email"
            label="Email"
            placeholder="contato@exemplo.com"
          />
          
          <RHFInput
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="whatsapp"
            label="WhatsApp"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="instagram"
            label="Instagram"
            placeholder="@usuario"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato para Booking</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInput
            name="booking_email"
            type="email"
            label="Email de Booking"
            placeholder="booking@exemplo.com"
          />
          
          <RHFInput
            name="booking_phone"
            label="Telefone de Booking"
            placeholder="(11) 99999-9999"
          />
          
          <RHFInput
            name="booking_whatsapp"
            label="WhatsApp de Booking"
            placeholder="(11) 99999-9999"
          />
        </CardContent>
      </Card>

      <RHFSocialLinks
        namePrefix="links"
        label="Links Sociais e Plataformas"
        showInstagram={false}
        showWebsite={true}
        showFacebook={true}
        showLinkedin={true}
        showYoutube={true}
        showTwitter={true}
      />

      <Card>
        <CardHeader>
          <CardTitle>URLs de Plataformas Musicais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFURLInput
            name="website_url"
            label="Website Principal"
            placeholder="https://www.exemplo.com"
          />
          
          <RHFURLInput
            name="spotify_url"
            label="Spotify"
            placeholder="https://open.spotify.com/artist/..."
            allowedDomains={['spotify.com']}
          />
          
          <RHFURLInput
            name="soundcloud_url"
            label="SoundCloud"
            placeholder="https://soundcloud.com/usuario"
            allowedDomains={['soundcloud.com']}
          />
          
          <RHFURLInput
            name="youtube_url"
            label="YouTube"
            placeholder="https://youtube.com/channel/..."
            allowedDomains={['youtube.com', 'youtu.be']}
          />
          
          <RHFURLInput
            name="beatport_url"
            label="Beatport"
            placeholder="https://www.beatport.com/artist/..."
            allowedDomains={['beatport.com']}
          />
          
          <RHFURLInput
            name="audius_url"
            label="Audius"
            placeholder="https://audius.co/usuario"
            allowedDomains={['audius.co']}
          />
        </CardContent>
      </Card>
    </div>
  );
};