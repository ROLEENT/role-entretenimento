# QA Final Checklist - Páginas Institucionais

## ✅ 1. Navegação
- [x] Header/Footer aparecem em `/agenda/outras-cidades` e nas 3 páginas institucionais novas
- [x] Sem flicker notável ao trocar de rotas (tema e dados protegidos por ClientOnly)
- [x] Todas as navegações usam `<Link>` do React Router
- [x] AgendaLayout aplicado corretamente nas rotas de agenda

## ✅ 2. Console
- [x] Erro Supabase 400/404 do blog_posts tratado com fallback
- [x] Removed reference to non-existent `excerpt` column
- [x] Added error handling to prevent console spam
- [x] React Router deprecation warnings são apenas avisos, não afetam funcionalidade

## ✅ 3. Acessibilidade
- [x] Títulos únicos (h1) em cada página institucional
- [x] Landmarks claros (`<main>`, `<section>`)
- [x] Links e botões com aria-label quando necessário
- [x] Breadcrumbs implementados corretamente

## ✅ 4. Responsividade
- [x] Títulos responsivos (text-4xl md:text-6xl)
- [x] Espaçamentos adaptáveis (py-16/py-24)
- [x] iframe do Spotify com width="100%" em Imprensa
- [x] Layout em grid responsivo (md:grid-cols-2, md:grid-cols-3)

## ✅ 5. SEO
- [x] Metadata por página (title/description)
- [x] Meta tags Open Graph
- [x] Links canônicos
- [x] Structured markup adequado

## 📝 Páginas Criadas

### /institucional/parcerias
- Formulário de contato para parcerias
- Informações sobre oportunidades de co-marketing
- Design responsivo com cards e gradientes

### /institucional/trabalhe-conosco
- Formulário de candidatura com validação
- Descrição de áreas (Curadoria, Conteúdo, Produto, Comercial)
- Upload de portfólio e seleção de área de interesse

### /institucional/imprensa
- Press kit e contatos para assessoria
- Embed do Spotify (Rádio Gaúcha ZH)
- Seção "Sobre o ROLÊ ENTRETENIMENTO"
- Área para cobertura na mídia (placeholder)

## 🔧 Correções Aplicadas

1. **BlocoRevista.tsx**: Removida referência à coluna `excerpt` inexistente
2. **Error Handling**: Adicionado fallback para erros de blog posts
3. **Links**: Corrigidos links de `/blog/` para `/revista/`
4. **Responsividade**: Verificado iframe do Spotify com width 100%

## 🚀 Próximos Passos

1. Deploy para staging
2. Teste em dispositivos móveis
3. Verificação de performance
4. Merge para main

## 📸 Screenshots

### Desktop
- [x] Header com navegação completa
- [x] Páginas institucionais com layout responsivo
- [x] Footer com links atualizados

### Mobile
- [x] Header colapsado com menu hamburger
- [x] Iframe do Spotify responsivo
- [x] Formulários adaptados para mobile