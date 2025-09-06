# Prompt para Menu Mobile ROLÊ - Lovable (Versão Atualizada)

Crie um menu mobile moderno e fluido para a plataforma ROLÊ (roleentretenimento.com) com as seguintes especificações:

## Design Geral
- **Estilo**: Menu overlay full-screen com fundo gradiente roxo/rosa suave
- **Animação de entrada**: Slide from top com easing suave usando Vaul drawer
- **Tipografia**: Sans-serif moderna, hierarquia clara
- **Tema**: Noturno/entertainment com toques vibrantes, suporte dark/light mode

## Header do Menu
- **Logo ROLÊ**: Imagem do logo oficial (`role-logo.png`) no topo esquerdo
- **Botão "X"**: Ícone minimalista no topo direito com hover effect
- **Barra de busca**: 
  - Placeholder "Buscar eventos, artistas..."
  - Ícone de lupa integrado
  - Auto-focus ao abrir menu
  - Submissão com Enter
  - Integração com `useGlobalSearch`

## Seção Principal - Cards Interativos

### Card "Explorar" (Destaque)
- **Layout**: Card grande em formato landscape
- **Elementos**: 
  - Ícone de estrela no canto esquerdo
  - Título "Explorar" (fonte grande, bold)
  - Subtítulo "Descubra o melhor da cena"
  - Contador dinâmico de eventos (props `eventCount`)
- **Styling**: Gradiente roxo-rosa, bordas arredondadas, hover elevation
- **Navegação**: Redireciona para `/agenda`

### Cards Secundários (Grid 2x1)
- **Card Eventos**: 
  - Ícone de calendário
  - Fundo lilás claro
  - Navegação para `/agenda/todos`
- **Card Artistas**: 
  - Ícone musical
  - Fundo pêssego claro  
  - Navegação para `/perfis?type=artista`
- **Interações**: Hover effects com scale sutil, active states

## Footer do Menu
- **Botão CTA**: "Entrar na plataforma"
  - Integração com `setShowPublicAuth` prop
  - Fundo roxo vibrante, texto branco, full-width
  - Bordas arredondadas, hover effects
- **Theme Toggle**: 
  - Ícone sol/lua alternando
  - Integração com `useTheme` hook
  - Posicionamento central inferior

## Especificações Técnicas

### Componente Props
```typescript
interface RoleMenuMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (term: string) => void;
  eventCount?: number;
  setShowPublicAuth?: (show: boolean) => void;
}
```

### Dependências
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS com design tokens
- **Drawer**: Vaul (drawer primitives)
- **Icons**: Lucide React
- **Navegação**: React Router DOM
- **Theme**: Custom theme provider

### Performance
- **Mobile-first**: Otimizado para telas 375px-428px
- **Touch-friendly**: Botões mínimo 44px de altura
- **Animações**: 300ms cubic-bezier para transições
- **Safe areas**: Suporte para notch e bottom safe area

## Paleta de Cores (Design System)
- **Gradientes**: `from-purple-100 via-pink-50 to-purple-50`
- **Dark mode**: `dark:from-purple-950/90 dark:via-pink-950/90 dark:to-purple-950/90`
- **Cards principais**: `from-purple-600 to-pink-600`
- **Cards secundários**: `from-purple-200 to-purple-300`, `from-pink-200 to-orange-200`
- **Backdrop**: `bg-black/40 backdrop-blur-sm`

## Comportamentos Implementados

### Funcionalidades Core
- **Abertura**: Backdrop blur no conteúdo principal
- **Busca**: Auto-focus, submissão com Enter, integração com busca global
- **Navegação**: React Router com fechamento automático do menu
- **Autenticação**: Abertura do modal de login via prop
- **Theme**: Toggle entre dark/light mode

### Estados e Feedback
- **Loading states**: Para busca e navegação
- **Empty states**: Contador "0 eventos" bem tratado
- **Touch feedback**: Scale animations em active states
- **Hover effects**: Elevation e color transitions

### Acessibilidade
- **Keyboard navigation**: Suporte completo
- **Screen readers**: Labels apropriados
- **Focus management**: Auto-focus na busca
- **Contrast**: Adequado para dark/light modes

## Estrutura de Arquivos
```
src/components/
├── RoleMenuMobile.tsx     # Componente principal
├── Header.tsx             # Integração no header
└── ui/                    # Componentes base (button, etc)

src/assets/
└── role-logo.png          # Logo oficial

src/hooks/
├── useGlobalSearch.ts     # Hook de busca
└── useTheme.ts           # Hook de tema
```

## Melhorias Futuras
- **Animações avançadas**: Usando Framer Motion
- **Gestos**: Swipe para fechar
- **PWA**: Suporte para instalação
- **Analytics**: Tracking de interações
- **Personalização**: Cards dinâmicos baseados no usuário
- **Notificações**: Badge de notificações no menu

## Integração com Sistema
- **Events**: Contador dinâmico via props
- **Search**: Integração com `useGlobalSearch`
- **Auth**: Modal de autenticação via `setShowPublicAuth`
- **Routing**: Navegação contextual baseada na estrutura da app
- **Theme**: Sincronização com sistema de tema global

Este menu foi projetado para ser o hub central de navegação mobile da plataforma ROLÊ, priorizando usabilidade, performance e experiência do usuário.