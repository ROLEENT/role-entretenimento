# Políticas de Segurança

## 🛡️ Visão Geral

Este documento descreve as políticas e práticas de segurança implementadas na plataforma Role Entretenimento.

## 🔐 Autenticação e Autorização

### Supabase Auth
- **JWT tokens** com expiração automática
- **Multi-factor authentication** disponível
- **OAuth providers** suportados (Google, GitHub, etc.)
- **Email confirmação** obrigatória

### Session Management
- **Auto-refresh** de tokens
- **Secure cookies** para sessões
- **Session timeout** configurável
- **Concurrent sessions** limitadas

## 🏛️ Row Level Security (RLS)

### Políticas Implementadas

#### Entity Profiles
```sql
-- Visualização pública
CREATE POLICY "Public profiles are viewable by everyone" ON entity_profiles
FOR SELECT USING (visibility = 'public');

-- Proprietário pode ver todos os seus perfis
CREATE POLICY "Users can view own profiles" ON entity_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Apenas proprietário pode modificar
CREATE POLICY "Users can update own profiles" ON entity_profiles
FOR UPDATE USING (auth.uid() = user_id);
```

#### Events
```sql
-- Eventos públicos visíveis para todos
CREATE POLICY "Published events are viewable by everyone" ON events
FOR SELECT USING (status = 'published');

-- Organizador pode gerenciar seus eventos
CREATE POLICY "Organizers can manage their events" ON events
FOR ALL USING (auth.uid() = organizer_id);
```

#### Media
```sql
-- Mídia de perfis públicos é visível
CREATE POLICY "Public profile media viewable" ON profile_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM entity_profiles 
    WHERE id = profile_id 
    AND visibility = 'public'
  )
);
```

### Validação de Dados
- **Input sanitization** em todos os endpoints
- **Type validation** via TypeScript e Zod
- **Size limits** para uploads
- **Content validation** para mídia

## 🔒 Proteção de Dados

### LGPD/GDPR Compliance

#### Princípios Implementados
- **Consentimento explícito** para coleta de dados
- **Minimização de dados** - apenas dados necessários
- **Transparência** sobre uso dos dados
- **Direito ao esquecimento** implementado
- **Portabilidade** de dados disponível

#### Dados Pessoais Protegidos
- **Emails** - criptografados em transit
- **Telefones** - armazenados com hash
- **Localizações** - apenas com consentimento
- **Imagens** - com controle de acesso

### Classificação de Dados
- **Públicos**: Perfis com visibility=public
- **Internos**: Dados administrativos
- **Confidenciais**: Dados pessoais de usuários
- **Restritos**: Tokens, senhas, chaves

## 🌐 Segurança da Aplicação

### Content Security Policy (CSP)
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://nutlcbnruabjsxecqpnd.supabase.co;
  font-src 'self';
  media-src 'self';
```

### Security Headers
```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### HTTPS Enforcement
- **TLS 1.3** obrigatório
- **HSTS** habilitado
- **Certificate pinning** em produção
- **Redirects automáticos** HTTP → HTTPS

## 🔧 Configurações de Segurança

### Supabase Database
```sql
-- Configurações de segurança do banco
ALTER DATABASE postgres SET log_statement = 'mod';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;
ALTER DATABASE postgres SET log_connections = on;
ALTER DATABASE postgres SET log_disconnections = on;
```

### Environment Variables
- **Sensitive data** apenas em secrets
- **API keys** rotacionadas regularmente
- **Development/Production** separação completa
- **Env validation** na inicialização

### Rate Limiting
```typescript
// Implementado via Supabase
const rateLimits = {
  auth: '60/minute',
  api_read: '100/minute',
  api_write: '30/minute',
  uploads: '10/minute'
};
```

## 🚨 Monitoramento e Alertas

### Security Monitoring
- **Failed login attempts** tracking
- **Unusual access patterns** detection
- **API abuse** monitoring
- **Data breach** detection

### Logging
```typescript
// Security events logged
const securityEvents = [
  'auth.login',
  'auth.failed_login',
  'auth.password_reset',
  'data.access_denied',
  'data.bulk_export',
  'admin.privilege_escalation'
];
```

### Incident Response
1. **Detection** - Automated monitoring
2. **Assessment** - Security team review
3. **Containment** - Isolate affected systems
4. **Eradication** - Remove threat
5. **Recovery** - Restore services
6. **Lessons Learned** - Post-incident review

## 🔍 Auditoria e Compliance

### Audit Trail
- **All database changes** logged
- **User actions** tracked
- **Admin operations** audited
- **Data access** monitored

### Regular Security Reviews
- **Monthly** vulnerability scans
- **Quarterly** penetration testing
- **Annual** security audit
- **Continuous** dependency updates

### Compliance Reports
- **LGPD** compliance monthly
- **Security metrics** weekly
- **Incident reports** as needed
- **Access reviews** quarterly

## 🛠️ Ferramentas de Segurança

### Automated Security
- **Dependabot** para dependências
- **CodeQL** para análise de código
- **Snyk** para vulnerabilidades
- **OWASP ZAP** para testes web

### Manual Security Testing
```bash
# Exemplo de testes de segurança
npm audit
npm run security:test
npx playwright test --grep security
```

## 📋 Responsabilidades

### Desenvolvimento
- **Secure coding** practices
- **Input validation** obrigatória
- **Security testing** antes deploy
- **Dependency updates** regulares

### DevOps
- **Infrastructure security** 
- **Secrets management**
- **Monitoring setup**
- **Backup encryption**

### Usuários
- **Strong passwords** obrigatórias
- **2FA** recomendado
- **Data minimization** guidelines
- **Suspicious activity** reporting

## 🚀 Segurança em Produção

### Deploy Security
```yaml
# GitHub Actions security
- name: Security Scan
  uses: securecodewarrior/github-action-add-sarif@v1
  with:
    sarif-file: security-results.sarif

- name: Dependency Check
  run: npm audit --audit-level=moderate
```

### Infrastructure Security
- **WAF** configurado (Cloudflare)
- **DDoS protection** ativo
- **Geo-blocking** para regiões suspeitas
- **IP whitelist** para admin

### Backup Security
- **Encrypted backups** daily
- **Offsite storage** configurado
- **Restoration testing** monthly
- **Retention policy** 90 dias

## 📞 Contato de Segurança

### Reportar Vulnerabilidades
- **Email**: security@roleentretenimento.com.br
- **Bug Bounty**: Em desenvolvimento
- **Response Time**: 24-48 horas
- **Public Disclosure**: 90 dias após correção

### Security Team
- **CISO**: Chief Information Security Officer
- **Security Engineers**: Implementação técnica
- **Compliance Officer**: Políticas e regulamentações
- **Incident Response**: Resposta a incidentes

---

**Última atualização**: Janeiro 2025  
**Próxima revisão**: Abril 2025

Para questões de segurança urgentes, entre em contato imediatamente através dos canais oficiais.