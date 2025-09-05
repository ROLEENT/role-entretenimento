# Guia de Desenvolvimento

## 🚀 Configuração Inicial

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação Local

```bash
# Clone o repositório
git clone [repository-url]
cd role-entretenimento

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

### Configuração do Ambiente

```env
VITE_SUPABASE_URL=https://nutlcbnruabjsxecqpnd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Inicialização

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Teste local de produção
npm run preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn)
│   ├── form/           # Componentes de formulário
│   └── admin/          # Componentes administrativos
├── features/           # Funcionalidades por domínio
│   ├── profiles/       # Sistema de perfis
│   ├── events/         # Sistema de eventos
│   └── auth/           # Autenticação
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
└── integrations/       # Integrações externas
```

## 🎨 Sistema de Design

### Tokens de Design
Definidos em `src/index.css`:

```css
:root {
  --primary: 280 100% 70%;
  --secondary: 280 100% 85%;
  --accent: 280 100% 90%;
  /* ... */
}
```

### Componentes
- Use componentes do `shadcn/ui`
- Customize via `className` com tokens
- Crie variantes nos componentes base

### Responsividade
- **Mobile-first** approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Componentes específicos mobile quando necessário

## 🔧 Padrões de Código

### TypeScript
- **Strict mode** habilitado
- Interfaces para todos os tipos
- **Generic types** quando aplicável

### React
- **Functional components** com hooks
- **Custom hooks** para lógica reutilizável
- **React Query** para estado do servidor

### Styling
- **Tailwind CSS** para estilos
- **CSS Modules** apenas quando necessário
- **Design tokens** obrigatórios

## 🗃️ Banco de Dados

### Supabase
- **PostgreSQL** com RLS
- **Migrations** versionadas
- **Políticas** granulares de acesso

### Principais Tabelas
- `entity_profiles` - Perfis de entidades
- `events` - Eventos culturais
- `event_highlights` - Destaques
- `event_registrations` - Inscrições
- `event_media` - Mídia dos eventos

### RLS Policies
Todas as tabelas sensíveis possuem policies:
- **SELECT**: Baseado em visibilidade
- **INSERT**: Apenas proprietários
- **UPDATE**: Apenas proprietários
- **DELETE**: Apenas proprietários

## 🧪 Testes

### Playwright
Configurado para testes E2E:

```bash
# Rodar testes
npm run test

# Modo interativo
npm run test:ui
```

### Validação de Sistema
Dashboard interno em `/admin/system-health` para:
- **Health checks** em tempo real
- **Performance monitoring**
- **Security validation**
- **Data integrity**

## 🔧 Ferramentas de Desenvolvimento

### ESLint & Prettier
```bash
# Lint
npm run lint

# Format
npm run format
```

### TypeScript
```bash
# Type check
npm run type-check
```

### Análise de Bundle
```bash
# Analyze
npm run analyze
```

## 🌐 APIs e Integrations

### Supabase Client
```typescript
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('entity_profiles')
  .select('*');
```

### React Query
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ['profiles'],
  queryFn: fetchProfiles
});
```

## 📱 Componentes Mobile

### Estrutura
```
src/features/profiles/components/
├── desktop/            # Versões desktop
└── mobile/            # Versões mobile
    ├── ProfileHeroMobile.tsx
    ├── ProfileTabsMobile.tsx
    └── index.ts
```

### Uso
```typescript
// Componente responsivo
const Profile = () => (
  <>
    <div className="hidden md:block">
      <ProfileDesktop />
    </div>
    <div className="md:hidden">
      <ProfileMobile />
    </div>
  </>
);
```

## 🚀 Deploy

### Lovable (Padrão)
- Deploy automático via Lovable
- Staging: `[project].lovable.app`
- Production: Custom domain

### Manual Deploy
Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para opções alternativas.

## 🔍 Debugging

### Console Logs
- Use `console.log` para desenvolvimento
- Remove em produção
- Utilize níveis: `info`, `warn`, `error`

### React Query Devtools
Habilitado apenas em desenvolvimento:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

### Supabase Logs
Acesse logs em tempo real no dashboard Supabase.

## 📋 Checklist de Desenvolvimento

- [ ] TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Componentes responsivos
- [ ] RLS policies testadas
- [ ] Performance otimizada
- [ ] SEO implementado
- [ ] Acessibilidade validada
- [ ] Testes passando

---

Para dúvidas específicas, consulte a documentação completa ou abra uma issue.