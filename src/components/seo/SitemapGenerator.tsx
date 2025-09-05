import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export class SitemapService {
  private static baseUrl = 'https://roleentretenimento.com.br';

  static async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Páginas estáticas principais
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/agenda', priority: 0.9, changefreq: 'daily' as const },
      { path: '/revista', priority: 0.8, changefreq: 'weekly' as const },
      { path: '/sobre', priority: 0.5, changefreq: 'monthly' as const },
      { path: '/contato', priority: 0.5, changefreq: 'monthly' as const },
      { path: '/politica-privacidade', priority: 0.3, changefreq: 'yearly' as const },
      { path: '/termos-uso', priority: 0.3, changefreq: 'yearly' as const }
    ];

    staticPages.forEach(page => {
      urls.push({
        loc: `${this.baseUrl}${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority
      });
    });

    try {
      // Eventos da tabela events
      const { data: events } = await supabase
        .from('events')
        .select('slug, updated_at, date_start')
        .eq('status', 'published')
        .order('date_start', { ascending: false })
        .limit(1000);

      events?.forEach(event => {
        urls.push({
          loc: `${this.baseUrl}/evento/${event.slug}`,
          lastmod: event.updated_at || event.date_start,
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      // Agenda items
      const { data: agendaItems } = await supabase
        .from('agenda_itens')
        .select('slug, updated_at, date_start')
        .eq('status', 'published')
        .order('date_start', { ascending: false })
        .limit(1000);

      agendaItems?.forEach(item => {
        urls.push({
          loc: `${this.baseUrl}/agenda/${item.slug}`,
          lastmod: item.updated_at || item.date_start,
          changefreq: 'weekly',
          priority: 0.7
        });
      });

      // Posts do blog/revista
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, city')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(500);

      posts?.forEach(post => {
        urls.push({
          loc: `${this.baseUrl}/revista/${post.city}/${post.slug}`,
          lastmod: post.updated_at,
          changefreq: 'monthly',
          priority: 0.6
        });
      });

      // Cidades com eventos
      const { data: cities } = await supabase
        .from('events')
        .select('city')
        .eq('status', 'published')
        .neq('city', null);

      const uniqueCities = [...new Set(cities?.map(c => c.city))];
      uniqueCities.forEach(city => {
        if (city) {
          urls.push({
            loc: `${this.baseUrl}/agenda?city=${encodeURIComponent(city)}`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.7
          });
        }
      });

    } catch (error) {
      console.error('Erro ao gerar sitemap:', error);
    }

    return this.buildXmlSitemap(urls);
  }

  static async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: WhatsApp
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Bloquear admin e arquivos temporários
Disallow: /admin/
Disallow: /temp/
Disallow: /*.json$
Disallow: /*?utm_*
Disallow: /*?fbclid=*
Disallow: /*?gclid=*`;
  }

  private static buildXmlSitemap(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlElements}
</urlset>`;
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Hook para usar no componente
export function useSitemapGenerator() {
  const downloadSitemap = async () => {
    try {
      const xml = await SitemapService.generateSitemap();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar sitemap:', error);
    }
  };

  const downloadRobots = async () => {
    try {
      const txt = await SitemapService.generateRobotsTxt();
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'robots.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar robots.txt:', error);
    }
  };

  return { downloadSitemap, downloadRobots };
}