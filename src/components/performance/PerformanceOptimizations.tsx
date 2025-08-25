import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Download, 
  FileText, 
  Globe, 
  Search, 
  TrendingUp,
  Clock,
  Gauge,
  CheckCircle
} from 'lucide-react';
import { useSitemapGenerator } from '@/utils/sitemapGenerator';
import { useCacheStats } from '@/hooks/useCache';
import { toast } from 'sonner';

export function PerformanceOptimizations() {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [seoOptimizations, setSeoOptimizations] = useState<any>(null);
  const { downloadSitemap, downloadRobotsTxt } = useSitemapGenerator();
  const cacheStats = useCacheStats();

  useEffect(() => {
    measurePerformance();
    checkSEOOptimizations();
  }, []);

  const measurePerformance = () => {
    // Measure Web Vitals and other performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length,
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      };

      setPerformanceMetrics(metrics);
    }
  };

  const checkSEOOptimizations = () => {
    const optimizations = {
      metaTags: {
        title: !!document.querySelector('title'),
        description: !!document.querySelector('meta[name="description"]'),
        viewport: !!document.querySelector('meta[name="viewport"]'),
        canonical: !!document.querySelector('link[rel="canonical"]'),
        ogTags: document.querySelectorAll('meta[property^="og:"]').length
      },
      images: {
        total: document.querySelectorAll('img').length,
        withAlt: document.querySelectorAll('img[alt]').length,
        lazy: document.querySelectorAll('img[loading="lazy"]').length
      },
      links: {
        internal: document.querySelectorAll('a[href^="/"]').length,
        external: document.querySelectorAll('a[href^="http"]').length,
        withTarget: document.querySelectorAll('a[target="_blank"]').length
      },
      structured: !!document.querySelector('script[type="application/ld+json"]'),
      performance: {
        minified: true, // Assume bundler handles this
        compressed: true, // Assume server handles this
        cdn: true // Assume CDN is used
      }
    };

    setSeoOptimizations(optimizations);
  };

  const handleDownloadSitemap = async () => {
    try {
      await downloadSitemap();
      toast.success('Sitemap gerado e baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar sitemap');
    }
  };

  const handleDownloadRobots = async () => {
    try {
      await downloadRobotsTxt();
      toast.success('Robots.txt gerado e baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar robots.txt');
    }
  };

  const clearCache = () => {
    // Clear various caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    
    toast.success('Cache limpo com sucesso!');
    setTimeout(() => window.location.reload(), 1000);
  };

  const getPerformanceScore = () => {
    if (!performanceMetrics) return 0;
    
    let score = 100;
    
    // Penalize slow loading times
    if (performanceMetrics.loadComplete > 3000) score -= 20;
    if (performanceMetrics.firstContentfulPaint > 1500) score -= 15;
    if (performanceMetrics.domContentLoaded > 2000) score -= 15;
    
    // Penalize too many resources
    if (performanceMetrics.resourceCount > 50) score -= 10;
    
    return Math.max(score, 0);
  };

  const getSEOScore = () => {
    if (!seoOptimizations) return 0;
    
    let score = 0;
    const { metaTags, images, structured } = seoOptimizations;
    
    // Meta tags (40 points)
    if (metaTags.title) score += 10;
    if (metaTags.description) score += 10;
    if (metaTags.viewport) score += 5;
    if (metaTags.canonical) score += 5;
    if (metaTags.ogTags > 3) score += 10;
    
    // Images (30 points)
    const imageScore = images.total > 0 ? (images.withAlt / images.total) * 20 : 0;
    score += imageScore;
    const lazyScore = images.total > 0 ? (images.lazy / images.total) * 10 : 0;
    score += lazyScore;
    
    // Structured data (30 points)
    if (structured) score += 30;
    
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Otimizações e Performance</h2>
        <p className="text-muted-foreground">
          Monitore e otimize a performance da plataforma
        </p>
      </div>

      {/* Performance Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics ? getPerformanceScore() : '--'}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em Core Web Vitals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seoOptimizations ? getSEOScore() : '--'}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Otimizações para mecanismos de busca
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats.total > 0 ? Math.round((cacheStats.active / cacheStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.active}/{cacheStats.total} entradas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
            <CardDescription>
              Tempos de carregamento e uso de recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">DOM Content Loaded</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.domContentLoaded)}ms
                </p>
                <Badge variant={performanceMetrics.domContentLoaded < 2000 ? "default" : "destructive"}>
                  {performanceMetrics.domContentLoaded < 2000 ? "Bom" : "Lento"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">First Contentful Paint</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.firstContentfulPaint)}ms
                </p>
                <Badge variant={performanceMetrics.firstContentfulPaint < 1500 ? "default" : "destructive"}>
                  {performanceMetrics.firstContentfulPaint < 1500 ? "Bom" : "Lento"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Load Complete</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.loadComplete)}ms
                </p>
                <Badge variant={performanceMetrics.loadComplete < 3000 ? "default" : "destructive"}>
                  {performanceMetrics.loadComplete < 3000 ? "Bom" : "Lento"}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recursos Carregados</p>
                <p className="text-2xl font-bold">
                  {performanceMetrics.resourceCount}
                </p>
                <Badge variant={performanceMetrics.resourceCount < 50 ? "default" : "secondary"}>
                  {performanceMetrics.resourceCount < 50 ? "Otimizado" : "Alto"}
                </Badge>
              </div>
            </div>

            {performanceMetrics.memoryUsage && (
              <div className="mt-4 p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Uso de Memória</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Usado</p>
                    <p className="font-medium">{performanceMetrics.memoryUsage.used} MB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">{performanceMetrics.memoryUsage.total} MB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Limite</p>
                    <p className="font-medium">{performanceMetrics.memoryUsage.limit} MB</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEO Optimizations */}
      {seoOptimizations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Otimizações SEO
            </CardTitle>
            <CardDescription>
              Status das otimizações para mecanismos de busca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Meta Tags */}
              <div>
                <h4 className="font-medium mb-2">Meta Tags</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    {seoOptimizations.metaTags.title ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <Clock className="h-4 w-4 text-yellow-600" />
                    }
                    <span>Title Tag</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {seoOptimizations.metaTags.description ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <Clock className="h-4 w-4 text-yellow-600" />
                    }
                    <span>Meta Description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {seoOptimizations.metaTags.viewport ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <Clock className="h-4 w-4 text-yellow-600" />
                    }
                    <span>Viewport Meta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {seoOptimizations.metaTags.canonical ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <Clock className="h-4 w-4 text-yellow-600" />
                    }
                    <span>Canonical Link</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Open Graph Tags: {seoOptimizations.metaTags.ogTags}
                </p>
              </div>

              <Separator />

              {/* Images */}
              <div>
                <h4 className="font-medium mb-2">Otimização de Imagens</h4>
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Imagens</p>
                    <p className="font-medium">{seoOptimizations.images.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Com Alt Text</p>
                    <p className="font-medium">
                      {seoOptimizations.images.withAlt} 
                      ({seoOptimizations.images.total > 0 ? 
                        Math.round((seoOptimizations.images.withAlt / seoOptimizations.images.total) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lazy Loading</p>
                    <p className="font-medium">
                      {seoOptimizations.images.lazy}
                      ({seoOptimizations.images.total > 0 ? 
                        Math.round((seoOptimizations.images.lazy / seoOptimizations.images.total) * 100) : 0}%)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Structured Data */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dados Estruturados</h4>
                  <p className="text-sm text-muted-foreground">
                    Schema.org markup para melhor indexação
                  </p>
                </div>
                <Badge variant={seoOptimizations.structured ? "default" : "secondary"}>
                  {seoOptimizations.structured ? "Implementado" : "Não implementado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gerenciamento de Cache
          </CardTitle>
          <CardDescription>
            Controle e monitoramento do sistema de cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{cacheStats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Entradas</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{cacheStats.active}</p>
                <p className="text-sm text-muted-foreground">Entradas Ativas</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{cacheStats.expired}</p>
                <p className="text-sm text-muted-foreground">Entradas Expiradas</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={clearCache} variant="outline">
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ferramentas SEO
          </CardTitle>
          <CardDescription>
            Gere arquivos essenciais para SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Sitemap.xml</h4>
                <p className="text-sm text-muted-foreground">
                  Gera um sitemap atualizado com todas as páginas do site
                </p>
                <Button onClick={handleDownloadSitemap} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Sitemap
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Robots.txt</h4>
                <p className="text-sm text-muted-foreground">
                  Gera arquivo robots.txt com instruções para crawlers
                </p>
                <Button onClick={handleDownloadRobots} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Robots.txt
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">📋 Próximos Passos</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Faça upload do sitemap.xml para o Google Search Console</li>
                <li>• Adicione o robots.txt na raiz do seu domínio</li>
                <li>• Configure monitoramento contínuo de performance</li>
                <li>• Implemente testes A/B para otimizações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => {
            measurePerformance();
            checkSEOOptimizations();
            toast.success('Métricas atualizadas!');
          }}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Atualizar Métricas
        </Button>
      </div>
    </div>
  );
}