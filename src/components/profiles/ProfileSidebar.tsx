import { Profile } from "@/features/profiles/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail } from "lucide-react";

interface ProfileSidebarProps {
  profile: Profile;
}

// Mock data - replace with real data later
const mockEvents = [
  {
    id: '1',
    day: '06',
    month: 'out',
    title: 'Festival VINIL 2024',
    city: 'São Paulo',
    venue: 'Centro',
    ticketUrl: '#'
  },
  {
    id: '2', 
    day: '15',
    month: 'nov',
    title: 'Show Acústico',
    city: 'Rio de Janeiro',
    venue: 'Lapa',
    ticketUrl: '#'
  }
];

const mockSimilar = [
  {
    slug: 'artista-1',
    display_name: 'João Silva',
    avatar_url: '/placeholder.svg'
  },
  {
    slug: 'artista-2', 
    display_name: 'Maria Santos',
    avatar_url: '/placeholder.svg'
  }
];

const mockTags = ['rock', 'indie', 'alternativo', 'nacional'];

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <>
      {/* Próximos Eventos */}
      <section id="agenda" className="rounded-2xl border p-4">
        <header className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Próximos eventos</h2>
          <a href={`/perfil/@${profile.handle}/agenda`} className="text-sm underline">
            ver todos
          </a>
        </header>
        
        <ul className="space-y-3">
          {mockEvents.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              Sem eventos por enquanto.
            </li>
          ) : (
            mockEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center leading-none">
                    <div className="text-2xl font-bold">{event.day}</div>
                    <div className="text-xs uppercase">{event.month}</div>
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.city} - {event.venue}
                    </p>
                  </div>
                </div>
                <a 
                  href={event.ticketUrl} 
                  className="rounded-lg px-3 py-1 border text-sm hover:bg-accent"
                >
                  Ingressos
                </a>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Tags */}
      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {mockTags.map((tag) => (
            <a 
              key={tag} 
              href={`/tag/${tag}`} 
              className="px-2 py-1 rounded-full border text-sm hover:bg-accent"
            >
              {tag}
            </a>
          ))}
        </div>
      </section>

      {/* Parecido com */}
      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Parecido com</h2>
        <ul className="space-y-3">
          {mockSimilar.map((artist) => (
            <li key={artist.slug} className="flex items-center gap-3">
              <img 
                src={artist.avatar_url} 
                alt={artist.display_name} 
                className="h-10 w-10 rounded-full object-cover" 
              />
              <a 
                href={`/perfil/@${artist.slug}`} 
                className="hover:underline"
              >
                {artist.display_name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Contato */}
      <section id="contato" className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Contato</h2>
        
        {profile.contact_email && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${profile.contact_email}`} className="underline">
              {profile.contact_email}
            </a>
          </div>
        )}
        
        <Button 
          asChild
          className="w-full bg-[hsl(280_100%_70%)] text-black hover:bg-[hsl(280_100%_70%_/_0.9)] font-semibold"
        >
          <a href={`mailto:${profile.contact_email || 'contato@example.com'}`}>
            Enviar mensagem
          </a>
        </Button>
      </section>
    </>
  );
}