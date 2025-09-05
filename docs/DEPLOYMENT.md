# Guia de Deploy e Produção

## 🚀 Opções de Deploy

### 1. Lovable (Recomendado)

**Deploy Automático**
- Conecte o GitHub via dashboard Lovable
- Deploys automáticos a cada push
- Staging: `[project].lovable.app`
- Production: Custom domain configurável

**Configuração**
1. Clique em "Publish" no editor Lovable
2. Configure domínio customizado em Settings
3. SSL automático via Let's Encrypt

### 2. Vercel

**Configuração**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json** (já configurado)
```json
{
  "redirects": [
    {
      "source": "/vitrine-cultural",
      "destination": "/agenda",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Netlify

**netlify.toml**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/vitrine-cultural"
  to = "/agenda"
  status = 301

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Docker

**Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente

**Supabase**
```env
VITE_SUPABASE_URL=https://nutlcbnruabjsxecqpnd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Sentry (Monitoramento)**
```env
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Build Otimizado

```bash
# Build com otimizações
npm run build

# Verificar tamanho do bundle
npm run analyze
```

### Configurações de Performance

**vite.config.ts**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

## 🛡️ Segurança em Produção

### Headers de Segurança

**nginx.conf**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### Supabase RLS
- **Todas as policies** validadas
- **Auth obrigatório** para operações sensíveis
- **Rate limiting** configurado

### HTTPS
- **SSL/TLS** obrigatório
- **HSTS** habilitado
- **Redirects** HTTP → HTTPS

## 📊 Monitoramento

### Métricas de Performance
- **Core Web Vitals**
- **Bundle size**
- **Load times**
- **Error rates**

### Logs
- **Supabase Analytics**
- **Sentry Error Tracking**
- **Custom Analytics**

### Alertas
```typescript
// Configuração Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.PROD ? 'production' : 'development',
  tracesSampleRate: 0.1,
});
```

## 🔧 Manutenção

### Backup de Dados
```sql
-- Backup automático via Supabase
-- Point-in-time recovery disponível
-- Retenção de 7 dias (plano free)
```

### Updates
```bash
# Dependências
npm update

# Supabase
npx supabase db diff --schema public
npx supabase db push
```

### Cache Strategy
```nginx
# Static assets
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML
location / {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

## 🌐 CDN e Edge

### Cloudflare (Recomendado)
- **Global CDN**
- **DDoS Protection**
- **Edge caching**
- **Analytics**

### Configuração DNS
```
A    @        104.21.xx.xx
A    www      104.21.xx.xx
AAAA @        2606:4700:xx:xx
```

## 📱 PWA Configuration

**manifest.json**
```json
{
  "name": "Role Entretenimento",
  "short_name": "Role",
  "description": "Plataforma Cultural",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#c77dff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Build sem erros
- [ ] Testes passando
- [ ] Lighthouse score > 90
- [ ] SEO otimizado
- [ ] RLS policies ativas
- [ ] Backup realizado

### Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] DNS configurado
- [ ] SSL ativo
- [ ] Headers de segurança
- [ ] Cache configurado

### Pós-Deploy
- [ ] Health check passou
- [ ] Monitoramento ativo
- [ ] Analytics configurado
- [ ] Performance validada
- [ ] Rollback strategy definida

## 🚨 Troubleshooting

### Problemas Comuns

**Build Falha**
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

**RLS Negando Acesso**
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'entity_profiles';
```

**Performance Lenta**
- Verificar bundle size
- Analisar Core Web Vitals
- Otimizar imagens
- Revisar queries SQL

---

Para suporte específico, consulte a documentação da plataforma escolhida ou abra uma issue.