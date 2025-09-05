# Documentação da API

## 📋 Visão Geral

A API é construída sobre **Supabase** com PostgreSQL e oferece endpoints REST automáticos, além de funcionalidade real-time via websockets.

**Base URL**: `https://nutlcbnruabjsxecqpnd.supabase.co`

## 🔐 Autenticação

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Tipos de Token
- **anon**: Acesso público limitado
- **authenticated**: Usuário logado
- **service_role**: Operações administrativas

## 👤 Autenticação

### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Out
```http
POST /auth/v1/logout
Authorization: Bearer <token>
```

## 👥 Perfis de Entidades

### Listar Perfis
```http
GET /rest/v1/entity_profiles?select=*&visibility=eq.public
```

**Parâmetros Query**
- `type`: artista, produtora, espaco, banda
- `visibility`: public, draft, private
- `limit`: número máximo de resultados
- `offset`: paginação

**Resposta**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "handle": "artista-exemplo",
    "name": "Artista Exemplo",
    "type": "artista",
    "visibility": "public",
    "bio": "Biografia do artista...",
    "image_url": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Criar Perfil
```http
POST /rest/v1/entity_profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "handle": "novo-artista",
  "name": "Novo Artista",
  "type": "artista",
  "bio": "Biografia...",
  "visibility": "draft"
}
```

### Obter Perfil por Handle
```http
GET /rest/v1/entity_profiles?select=*&handle=eq.artista-exemplo&single=true
```

### Atualizar Perfil
```http
PATCH /rest/v1/entity_profiles?id=eq.<profile_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "bio": "Nova biografia..."
}
```

## 🎭 Eventos

### Listar Eventos
```http
GET /rest/v1/events?select=*,entity_profiles(name,handle,image_url)&status=eq.published
```

**Filtros Disponíveis**
- `status`: draft, published, cancelled
- `event_date`: data do evento
- `location`: localização
- `organizer_id`: ID do organizador

**Resposta**
```json
[
  {
    "id": "uuid",
    "title": "Show de Rock",
    "description": "Descrição do evento...",
    "event_date": "2025-02-01T20:00:00Z",
    "location": "São Paulo, SP",
    "status": "published",
    "organizer_id": "uuid",
    "entity_profiles": {
      "name": "Banda XYZ",
      "handle": "banda-xyz",
      "image_url": "https://..."
    }
  }
]
```

### Criar Evento
```http
POST /rest/v1/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Novo Evento",
  "description": "Descrição...",
  "event_date": "2025-02-01T20:00:00Z",
  "location": "São Paulo, SP",
  "organizer_id": "uuid"
}
```

### Inscrições em Eventos
```http
POST /rest/v1/event_registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": "uuid",
  "user_email": "user@example.com",
  "registration_data": {
    "name": "Nome Completo",
    "phone": "+5511999999999"
  }
}
```

## 🌟 Destaques

### Listar Destaques Ativos
```http
GET /rest/v1/event_highlights?select=*,events(title,event_date),entity_profiles(name,handle)&is_active=eq.true
```

### Criar Destaque
```http
POST /rest/v1/event_highlights
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": "uuid",
  "highlight_type": "featured",
  "priority": 1,
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z"
}
```

## 📸 Mídia

### Upload de Arquivo
```http
POST /storage/v1/object/profiles/<profile_id>/<filename>
Authorization: Bearer <token>
Content-Type: image/jpeg

<binary_data>
```

### Listar Mídia de Perfil
```http
GET /rest/v1/profile_media?select=*&profile_id=eq.<profile_id>&is_active=eq.true
```

### Mídia de Eventos
```http
GET /rest/v1/event_media?select=*&event_id=eq.<event_id>
```

## 🎵 Gêneros

### Listar Gêneros
```http
GET /rest/v1/music_genres?select=*&is_active=eq.true
```

### Gêneros de Perfil
```http
GET /rest/v1/profile_genres?select=*,music_genres(name,color)&profile_id=eq.<profile_id>
```

## 📍 Localização

### Buscar por Localização
```http
GET /rest/v1/entity_profiles?select=*&location=ilike.%São Paulo%
```

### Eventos por Região
```http
GET /rest/v1/events?select=*&location=ilike.%Rio de Janeiro%&event_date=gte.2025-01-01
```

## 🔍 Busca e Filtros

### Busca Global
```http
GET /rest/v1/entity_profiles?or=(name.ilike.%termo%,bio.ilike.%termo%)&visibility=eq.public
```

### Filtros Avançados
```http
GET /rest/v1/events?select=*&and=(status.eq.published,event_date.gte.2025-01-01,event_date.lte.2025-12-31)
```

## 📊 Analytics

### Estatísticas do Sistema
```http
GET /rest/v1/rpc/get_system_stats
Authorization: Bearer <token>
```

**Resposta**
```json
{
  "total_profiles": 150,
  "total_events": 45,
  "active_highlights": 12,
  "recent_registrations": 23
}
```

## 🔄 Real-time

### Websocket Connection
```javascript
import { supabase } from '@/integrations/supabase/client';

// Escutar mudanças em perfis
const subscription = supabase
  .channel('profiles')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'entity_profiles' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();
```

### Eventos em Tempo Real
```javascript
// Novos eventos
supabase
  .channel('events')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'events' },
    handleNewEvent
  )
  .subscribe();
```

## 🚨 Códigos de Erro

### HTTP Status Codes
- `200`: Sucesso
- `201`: Criado
- `400`: Bad Request
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `409`: Conflito
- `422`: Dados inválidos
- `500`: Erro interno

### Estrutura de Erro
```json
{
  "error": {
    "message": "Descrição do erro",
    "details": "Detalhes adicionais",
    "hint": "Sugestão de solução",
    "code": "PGRST123"
  }
}
```

## 🔒 Rate Limiting

### Limites por Endpoint
- **Auth**: 60 req/min
- **GET**: 100 req/min
- **POST/PATCH**: 30 req/min
- **DELETE**: 10 req/min

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## 📝 Exemplos de Integração

### JavaScript/TypeScript
```typescript
import { supabase } from '@/integrations/supabase/client';

// Buscar perfis
const { data: profiles, error } = await supabase
  .from('entity_profiles')
  .select('*')
  .eq('visibility', 'public')
  .limit(10);

// Criar evento
const { data: event, error } = await supabase
  .from('events')
  .insert({
    title: 'Novo Evento',
    description: 'Descrição...',
    event_date: '2025-02-01T20:00:00Z',
    organizer_id: userId
  })
  .select()
  .single();
```

### cURL
```bash
# Listar perfis públicos
curl -X GET \
  'https://nutlcbnruabjsxecqpnd.supabase.co/rest/v1/entity_profiles?visibility=eq.public' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Authorization: Bearer <token>'

# Criar perfil
curl -X POST \
  'https://nutlcbnruabjsxecqpnd.supabase.co/rest/v1/entity_profiles' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "handle": "novo-artista",
    "name": "Novo Artista",
    "type": "artista"
  }'
```

## 🧪 Ambiente de Testes

### Base URL Staging
`https://nutlcbnruabjsxecqpnd.supabase.co`

### Dados de Teste
- **User**: test@example.com
- **Password**: test123456

---

Para mais detalhes, consulte a [documentação do Supabase](https://supabase.com/docs) ou o [dashboard do projeto](https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd).