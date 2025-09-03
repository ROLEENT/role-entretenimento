# API Reference - Sistema de Eventos

## Funções RPC (Supabase)

### `create_event_cascade`

Cria um evento completo com todas as relações associadas em uma única transação.

```sql
create_event_cascade(
  event_data jsonb,
  partners jsonb DEFAULT '[]'::jsonb,
  lineup_slots jsonb DEFAULT '[]'::jsonb,
  performances jsonb DEFAULT '[]'::jsonb,
  visual_artists jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
```

#### Parâmetros

**event_data** (jsonb)
```typescript
interface EventData {
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  venue_id?: string;
  location_name?: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  date_start: string; // ISO timestamp
  date_end?: string;
  doors_open_utc?: string;
  headliner_starts_utc?: string;
  image_url?: string;
  cover_url?: string;
  cover_alt?: string;
  gallery?: string[];
  price_min?: number;
  price_max?: number;
  currency?: string;
  ticket_url?: string;
  ticketing?: object;
  ticket_rules?: string[];
  age_rating?: 'livre' | '16' | '18';
  age_notes?: string;
  genres?: string[];
  tags?: string[];
  highlight_type?: 'none' | 'destaque' | 'vitrine';
  is_sponsored?: boolean;
  links?: object;
  accessibility?: object;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  series_id?: string;
  edition_number?: number;
  status?: 'draft' | 'published' | 'archived';
  visibility?: string;
}
```

**partners** (jsonb[])
```typescript
interface Partner {
  partner_id: string;
  partner_type: string;
  role: 'organizer' | 'supporter' | 'sponsor';
  display_name?: string;
  position?: number;
  is_main?: boolean;
}
```

**lineup_slots** (jsonb[])
```typescript
interface LineupSlot {
  slot_name: string;
  start_time?: string;
  end_time?: string;
  stage?: string;
  position?: number;
  is_headliner?: boolean;
  notes?: string;
  artists?: {
    artist_id?: string;
    artist_name: string;
    position?: number;
    role?: string;
  }[];
}
```

**performances** (jsonb[])
```typescript
interface Performance {
  performer_name: string;
  performance_type: string;
  description?: string;
  start_time?: string;
  duration_minutes?: number;
  stage?: string;
  position?: number;
  contact_info?: object;
}
```

**visual_artists** (jsonb[])
```typescript
interface VisualArtist {
  artist_name: string;
  art_type: string;
  description?: string;
  installation_location?: string;
  contact_info?: object;
  artwork_images?: string[];
  position?: number;
}
```

#### Retorno
Retorna o UUID do evento criado.

#### Exemplo de Uso

```typescript
const { data: eventId, error } = await supabase.rpc('create_event_cascade', {
  event_data: {
    title: "Festival Rock in Rio",
    subtitle: "Maior festival de música do Brasil",
    city: "Rio de Janeiro",
    date_start: "2024-09-15T18:00:00Z",
    date_end: "2024-09-22T23:00:00Z",
    venue_id: "cidade-do-rock-uuid",
    highlight_type: "vitrine",
    is_sponsored: true,
    status: "published"
  },
  partners: [
    {
      partner_id: "rock-world-uuid",
      partner_type: "organizer",
      role: "organizer",
      is_main: true,
      position: 0
    }
  ],
  lineup_slots: [
    {
      slot_name: "Palco Mundo - Noite 1",
      start_time: "2024-09-15T20:00:00Z",
      end_time: "2024-09-15T23:00:00Z",
      stage: "Palco Mundo",
      is_headliner: true,
      position: 0,
      artists: [
        {
          artist_name: "Iron Maiden",
          position: 0,
          role: "headliner"
        }
      ]
    }
  ]
});
```

## Services

### `eventService`

Serviço principal para operações com eventos.

#### `getEvents(filters, limit, offset)`

Busca eventos com filtros e paginação.

```typescript
interface EventFilters {
  city?: string;
  search?: string;
  categories?: string[];
  price_min?: number;
  price_max?: number;
  date_start?: Date;
  date_end?: Date;
  highlight_type?: string;
  status?: string;
}

const events = await eventService.getEvents({
  city: 'sao-paulo',
  search: 'rock',
  date_start: new Date(),
  categories: ['música', 'festival']
}, 20, 0);
```

#### `getEventById(id)`

Busca evento por ID com todos os relacionamentos.

```typescript
const event = await eventService.getEventById('event-uuid');
// Retorna evento com venues, organizers, lineup, etc.
```

#### `getNearbyEvents(lat, lng, radiusKm)`

Busca eventos próximos usando coordenadas geográficas.

```typescript
const nearbyEvents = await eventService.getNearbyEvents(
  -23.5505, // latitude
  -46.6333, // longitude
  10 // raio em km
);
```

#### `getFeaturedEvents(limit)`

Busca eventos em destaque.

```typescript
const featured = await eventService.getFeaturedEvents(5);
```

#### `getEventsByCity(city, limit)`

Busca eventos por cidade.

```typescript
const events = await eventService.getEventsByCity('sao-paulo', 20);
```

#### `getTodaysEvents()`

Busca eventos de hoje.

```typescript
const todayEvents = await eventService.getTodaysEvents();
```

### `favoriteService`

Gerenciamento de favoritos de usuários.

#### `getFavorites(userId)`
```typescript
const favorites = await favoriteService.getFavorites('user-uuid');
```

#### `addFavorite(eventId)`
```typescript
await favoriteService.addFavorite('event-uuid');
```

#### `removeFavorite(eventId)`
```typescript
await favoriteService.removeFavorite('event-uuid');
```

#### `isFavorited(eventId)`
```typescript
const isFav = await favoriteService.isFavorited('event-uuid');
```

### `reviewService`

Sistema de avaliações de eventos.

#### `getEventReviews(eventId)`
```typescript
const reviews = await reviewService.getEventReviews('event-uuid');
```

#### `addReview(eventId, rating, comment)`
```typescript
await reviewService.addReview('event-uuid', 5, 'Evento incrível!');
```

#### `updateReview(reviewId, rating, comment)`
```typescript
await reviewService.updateReview('review-uuid', 4, 'Atualização da review');
```

#### `deleteReview(reviewId)`
```typescript
await reviewService.deleteReview('review-uuid');
```

## Componentes React

### `EventCreateWizard`

Componente principal para criação/edição de eventos.

```typescript
interface EventCreateWizardProps {
  initialData?: EventFormData;
  onSave: (data: EventFormData) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

<EventCreateWizard
  initialData={existingEvent}
  onSave={handleSave}
  onCancel={handleCancel}
  mode="edit"
/>
```

### `EventCardV3`

Card de exibição de eventos com variações.

```typescript
interface EventCardV3Props {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
  showFavorite?: boolean;
  onFavoriteToggle?: (eventId: string) => void;
}

<EventCardV3
  event={event}
  variant="featured"
  showFavorite={true}
  onFavoriteToggle={handleFavorite}
/>
```

### `PublishChecklist`

Checklist de validação para publicação.

```typescript
interface PublishChecklistProps {
  eventData: EventFormData;
  onValidationChange?: (isValid: boolean, issues: ValidationIssue[]) => void;
}

<PublishChecklist
  eventData={formData}
  onValidationChange={(valid, issues) => {
    setIsValid(valid);
    setValidationIssues(issues);
  }}
/>
```

### `EventGrid`

Layout responsivo para lista de eventos.

```typescript
interface EventGridProps {
  events: Event[];
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

<EventGrid
  events={events}
  loading={isLoading}
  columns={3}
  gap="md"
/>
```

## Schemas de Validação (Zod)

### `eventFormSchema`

Schema principal para validação do formulário.

```typescript
import { eventFormSchema } from '@/components/events/schemas';

const result = eventFormSchema.safeParse(formData);
if (result.success) {
  // Dados válidos
  const validData = result.data;
} else {
  // Erros de validação
  const errors = result.error.issues;
}
```

### Subschemas Disponíveis

- `basicInfoSchema` - Informações básicas
- `locationSchema` - Local e endereço
- `lineupSchema` - Lineup e artistas
- `partnersSchema` - Parceiros
- `detailsSchema` - Detalhes e configurações

## Utilitários

### `adaptAgendaItemToEvent`

Converte dados da estrutura antiga para nova.

```typescript
import { adaptAgendaItemToEvent } from '@/components/events/adapters';

const eventData = adaptAgendaItemToEvent(agendaItem);
```

### `SearchCache`

Cache inteligente para buscas.

```typescript
import { SearchCache } from '@/lib/cache';

const cache = SearchCache.getInstance();
cache.set('venues', query, results, 300000); // 5 min TTL
const cached = cache.get('venues', query);
cache.clear('venues'); // Limpar cache de venues
```

## Códigos de Status

### Status de Evento
- `draft` - Rascunho
- `published` - Publicado
- `archived` - Arquivado

### Highlight Types
- `none` - Sem destaque
- `destaque` - Destaque editorial
- `vitrine` - Vitrine comercial

### Age Ratings
- `livre` - Livre para todos
- `16` - 16 anos ou mais
- `18` - 18 anos ou mais

## Códigos de Erro

### Erros Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| `INVALID_VENUE` | Venue não encontrado | Verificar venue_id |
| `INVALID_DATE` | Data inválida | Verificar formato ISO |
| `MISSING_TITLE` | Título obrigatório | Preencher campo title |
| `INVALID_PARTNER` | Parceiro inválido | Verificar partner_id |
| `DUPLICATE_SLUG` | Slug já existe | Gerar novo slug |

### Debugging

```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'events:*');

// Verificar cache
console.log(SearchCache.getInstance());

// Validar schema
const validation = eventFormSchema.safeParse(data);
console.log(validation.error?.issues);
```