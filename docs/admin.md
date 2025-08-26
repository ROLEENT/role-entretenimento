# Manual do Painel Administrativo

## Visão Geral

Este documento fornece uma visão completa do painel administrativo do sistema, incluindo rotas, funcionalidades, dependências e instruções de manutenção.

## Mapa de Rotas

### Autenticação
- `/admin/login` - Login administrativo
- `/admin/signup` - Cadastro de novos administradores  
- `/admin/profile` - Perfil do administrador

### Painel Principal
- `/admin` - Dashboard principal com métricas e links rápidos

### Gestão de Conteúdo
- `/admin/highlights` - Lista de destaques
- `/admin/highlights/create` - Criar novo destaque
- `/admin/highlights/:id/edit` - Editar destaque específico

### Gestão de Entidades
- `/admin/organizers` - Lista de organizadores
- `/admin/venues` - Lista de locais/venues
- `/admin/categories` - Lista de categorias
- `/admin/events` - Lista de eventos
- `/admin/events/create` - Criar novo evento
- `/admin/events/edit/:id` - Editar evento específico

### Gestão de Parceiros e Anúncios
- `/admin/partners/*` - Gestão de parceiros (lista e formulário)
- `/admin/advertisements/*` - Gestão de anúncios (lista e formulário)

### Blog e Comunicação
- `/admin/posts/new` - Criar novo post
- `/admin/posts/:id/edit` - Editar post existente
- `/admin/posts/history` - Histórico de posts e revisões
- `/admin/newsletter` - Gestão de newsletter

### Moderação
- `/admin/comments` - Moderação de comentários
- `/admin/contact-messages` - Gestão de mensagens de contato

### Análises e Notificações
- `/admin/analytics` - Painel de análises
- `/admin/analytics-reports` - Relatórios detalhados
- `/admin/notifications` - Gestão de notificações push
- `/admin/metrics` - Métricas gerais
- `/admin/testimonials` - Depoimentos
- `/admin/performance` - Performance do sistema
- `/admin/adsense` - Configurações do Google AdSense

## Descrição Detalhada por Página

### Dashboard (`/admin`)
**Campos e Funcionalidades:**
- Cards de acesso rápido para todas as seções
- Estatísticas gerais do sistema
- Status do sistema e informações de saúde

**Fluxos:**
1. Login → Dashboard → Navegação para seções específicas
2. Visualização de métricas em tempo real

**Dependências:**
- `AdminStats` component
- `AdminDashboard` component
- React Query para cache de dados

### Gestão de Organizadores (`/admin/organizers`)
**Campos:**
- Nome (obrigatório)
- Email de contato (obrigatório)
- Site (opcional)
- Instagram (opcional)

**Funcionalidades:**
- Paginação server-side (20 itens por página)
- Busca por nome
- CRUD completo com validação
- Estados de loading padronizados

**Fluxos:**
1. Lista → Criar/Editar → Validação → Salvar → Atualizar lista
2. Busca → Filtro em tempo real → Resultados paginados

### Gestão de Parceiros (`/admin/partners`)
**Campos:**
- Nome, email, localização
- Website, Instagram
- Imagem, featured status
- Rating, capacidade, tipos

**Funcionalidades:**
- Lista com busca e filtros
- Formulário de criação/edição
- Upload de imagens
- Toggle de status ativo/inativo

### Gestão de Destaques (`/admin/highlights`)
**Campos:**
- Cidade, título do evento, local
- URL do ticket, texto da Role
- Razões de seleção (array)
- Imagem, crédito da foto
- Data, hora, preço do evento
- Ordem de exibição, status de publicação

**Funcionalidades:**
- Editor rico para criação/edição
- Preview em tempo real
- Gestão de status de publicação
- Sistema de curtidas

### Perfil do Admin (`/admin/profile`)
**Campos:**
- Nome de exibição
- Email (readonly)
- Senha atual/nova senha

**Funcionalidades:**
- Edição de dados pessoais
- Alteração de senha com validação
- Validação de força da senha
- Confirmação por senha atual

### Moderação de Comentários (`/admin/comments`)
**Funcionalidades:**
- Lista de comentários pendentes/aprovados
- Aprovação/rejeição em massa
- Filtros por status e data
- Preview do contexto do comentário

### Analytics (`/admin/analytics`)
**Funcionalidades:**
- Métricas de eventos e usuários
- Gráficos interativos
- Exportação de relatórios
- Filtragem por período

## Variáveis de Ambiente

### Obrigatórias
```env
VITE_SUPABASE_PROJECT_ID="nutlcbnruabjsxecqpnd"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://nutlcbnruabjsxecqpnd.supabase.co"
```

### Para Produção
- Configurar variáveis no painel do Vercel/plataforma de deploy
- Certificar-se de que as URLs estão corretas para o ambiente

## Tabelas e Políticas RLS

### Principais Tabelas Utilizadas

#### `admin_users`
- **Campos:** id, email, password_hash, full_name, is_active
- **RLS:** Admins podem ver/editar apenas próprio perfil
- **Função:** Autenticação administrativa

#### `approved_admins`
- **Campos:** email, approved_by, is_active
- **RLS:** Admins podem gerenciar lista de admins aprovados
- **Função:** Controle de acesso administrativo

#### `organizers`
- **Campos:** name, contact_email, site, instagram
- **RLS:** Administradores têm acesso completo
- **Função:** Gestão de organizadores de eventos

#### `venues`
- **Campos:** name, address, city, capacity, lat, lng
- **RLS:** Admins podem gerenciar, público pode visualizar
- **Função:** Locais para eventos

#### `categories`
- **Campos:** name, slug, description, color, type
- **RLS:** Admin para gestão, público para visualização
- **Função:** Categorização de conteúdo

#### `events`
- **Campos:** title, description, date_start, date_end, city, state, venue_id, organizer_id
- **RLS:** Admins podem gerenciar, público vê apenas ativos
- **Função:** Gestão de eventos

#### `highlights`
- **Campos:** city, event_title, venue, ticket_url, image_url, is_published
- **RLS:** Função `admin_create_highlight` para CRUD administrativo
- **Função:** Destaques semanais

#### `blog_posts`
- **Campos:** title, content_html, slug, status, author_id
- **RLS:** Editores podem criar, admins podem gerenciar tudo
- **Função:** Sistema de blog

#### `blog_comments`
- **Campos:** post_id, author_name, content, is_approved
- **RLS:** Admins podem moderar, usuários podem criar
- **Função:** Comentários do blog

#### `advertisements`
- **Campos:** title, description, cta_text, cta_url, type, active
- **RLS:** Admins podem gerenciar, público vê apenas ativos
- **Função:** Sistema de anúncios

#### `partners`
- **Campos:** name, contact_email, location, website, featured
- **RLS:** Admins podem gerenciar
- **Função:** Parceiros e venues

### Funções Críticas de Segurança

#### `is_admin_session_valid(email)`
- Valida se email é de admin ativo
- Usado em todas as políticas administrativas

#### `is_admin_user()`
- Verifica admin via header x-admin-email
- Política principal para operações administrativas

#### `admin_create_highlight()` / `admin_update_highlight()`
- CRUD seguro para destaques
- Validação de permissões integrada

## Arquitetura e Performance

### React Query (TanStack Query)
- **Cache:** Estratégia stale-while-revalidate
- **Invalidação:** Por chaves específicas (`queryKeys`)
- **Refetch:** Automático em focus/reconexão

### Lazy Loading
- Todas as rotas administrativas usam `React.lazy()`
- `Suspense` com fallbacks personalizados
- Reduz bundle inicial em ~60%

### Paginação
- Server-side para listas >50 itens
- Padrão: 20 itens por página
- Busca com debounce (300ms)

### Estados de Loading
- Botões com estados loading padronizados
- Skeletons para carregamento de listas
- Indicadores visuais em todas as operações

## Testes E2E

### Configuração
```bash
# Instalar dependências
npm install

# Configurar conta de teste (ver tests/README.md)
# Email: admin@test.com
# Senha: TestPassword123!
```

### Executar Testes
```bash
# Todos os testes
npm run test:e2e

# Com interface gráfica
npm run test:e2e:ui

# Em modo debug
npm run test:e2e:debug

# Visualizar relatório
npm run test:e2e:report
```

### Cenários Cobertos
- ✅ Login administrativo
- ✅ CRUD de organizadores
- ✅ CRUD de venues
- ✅ CRUD de categorias
- ✅ CRUD de eventos
- ✅ Edição de perfil
- ✅ Alteração de senha
- ✅ Moderação de comentários
- ✅ Gestão de mensagens de contato
- ✅ Criação de posts
- ✅ Notificações push

### Configuração CI
- Tests rodam no port 8080
- Conta admin deve existir no banco
- Timeout aumentado para operações de rede

## Deploy e Manutenção

### Pré-requisitos
1. **Conta Admin Inicial:**
   ```sql
   INSERT INTO approved_admins (email, approved_by, is_active) 
   VALUES ('admin@suaempresa.com', 'system', true);
   ```

2. **Variáveis de Ambiente:** Configurar no painel da plataforma

3. **Migrações:** Executar via Supabase CLI ou dashboard

### Deploy
```bash
# Build de produção
npm run build

# Deploy no Vercel (automático via GitHub)
# ou manual: vercel --prod
```

### Monitoramento
- **Logs:** Console do navegador com prefixo `[ADMIN]`
- **Performance:** React Query DevTools em desenvolvimento
- **Erros:** Supabase Dashboard > Edge Functions > Logs

### Manutenção Regular
1. **Verificar logs de erro** semanalmente
2. **Backup do banco** via Supabase
3. **Atualizar dependências** mensalmente
4. **Revisar políticas RLS** quando adicionar funcionalidades
5. **Executar testes E2E** antes de cada deploy

### Resolução de Problemas

#### "Acesso negado" em operações
- Verificar se admin está na tabela `approved_admins`
- Confirmar header `x-admin-email` sendo enviado
- Checar políticas RLS da tabela específica

#### Performance lenta
- Verificar cache do React Query
- Otimizar queries do Supabase (índices)
- Revisar tamanho das páginas (paginação)

#### Testes falhando
- Confirmar conta de teste existe
- Verificar se servidor está rodando na porta 8080
- Limpar cache: `npx playwright cache clear`

## Extensibilidade

### Adicionar Nova Página Admin
1. Criar arquivo em `src/pages/admin/`
2. Adicionar rota em `src/App.tsx` 
3. Atualizar `AdminSidebar.tsx`
4. Criar hooks em `useAdminQueries.ts`
5. Adicionar testes em `admin.e2e.spec.ts`

### Adicionar Nova Tabela
1. Migração SQL via Supabase
2. Políticas RLS adequadas
3. Hooks do React Query
4. Componentes de UI
5. Testes E2E

### Adicionar Validação
1. Zod schema para tipos
2. Validação no frontend (React Hook Form)
3. Validação no banco (triggers/constraints)
4. Mensagens de erro amigáveis

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Contato:** Verificar documentação do projeto principal