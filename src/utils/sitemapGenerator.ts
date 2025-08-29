import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl = 'https://role.lovable.app';
  
  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];
    
    // Static pages (removed old routes)
    const staticPages = [
      { loc: '/', changefreq: 'daily' as const, priority: 1.0 },
      { loc: '/agenda', changefreq: 'daily' as const, priority: 0.9 },
      { loc: '/sobre', changefreq: 'monthly' as const, priority: 0.6 },
      { loc: '/contato', changefreq: 'monthly' as const, priority: 0.5 },
      { loc: '/privacy-policy', changefreq: 'yearly' as const, priority: 0.3 },
      { loc: '/user-terms', changefreq: 'yearly' as const, priority: 0.3 }
    ];
    
    urls.push(...staticPages.map(page => ({
      ...page,
      loc: `${this.baseUrl}${page.loc}`,
      lastmod: new Date().toISOString().split('T')[0]
    })));

    // Dynamic pages - Events
    try {
      const { data: events } = await supabase
        .from('events')
        .select('id, updated_at')
        .eq('status', 'active')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(1000);

      if (events) {
        events.forEach(event => {
          urls.push({
            loc: `${this.baseUrl}/events/${event.id}`,
            lastmod: event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }
    } catch (error) {
      console.error('Error fetching events for sitemap:', error);
    }

    // Dynamic pages - Blog Posts
    try {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(500);

      if (posts) {
        posts.forEach(post => {
          urls.push({
            loc: `${this.baseUrl}/blog/${post.slug}`,
            lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'monthly',
            priority: 0.6
          });
        });
      }
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    // Dynamic pages - Highlights
    try {
      const { data: highlights } = await supabase
        .from('highlights')
        .select('id, updated_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(200);

      if (highlights) {
        highlights.forEach(highlight => {
          urls.push({
            loc: `${this.baseUrl}/highlights/${highlight.id}`,
            lastmod: highlight.updated_at ? new Date(highlight.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'monthly',
            priority: 0.7
          });
        });
      }
    } catch (error) {
      console.error('Error fetching highlights for sitemap:', error);
    }

    // City pages
    try {
      const { data: cities } = await supabase
        .from('events')
        .select('city')
        .eq('status', 'active')
        .gte('date_start', new Date().toISOString());

      if (cities) {
        const uniqueCities = [...new Set(cities.map(c => c.city))];
        uniqueCities.forEach(city => {
          const citySlug = city.toLowerCase().replace(/\s+/g, '-');
          urls.push({
            loc: `${this.baseUrl}/city/${citySlug}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 0.8
          });
        });
      }
    } catch (error) {
      console.error('Error fetching cities for sitemap:', error);
    }

    return this.buildXmlSitemap(urls);
  }

  private buildXmlSitemap(urls: SitemapUrl[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    urls.forEach(url => {
      xml += `
  <url>
    <loc>${this.escapeXml(url.loc)}</loc>`;
      
      if (url.lastmod) {
        xml += `
    <lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        xml += `
    <changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority) {
        xml += `
    <priority>${url.priority}</priority>`;
      }
      
      xml += `
  </url>`;
    });

    xml += `
</urlset>`;

    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin/
Disallow: /api/

# Disallow private content
Disallow: /profile/
Disallow: /auth/

# Allow important pages
Allow: /events/
Allow: /highlights/
Allow: /blog/
Allow: /city/

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Specific rules for different bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;
  }
}

// Hook for generating and downloading sitemap
export function useSitemapGenerator() {
  const generator = new SitemapGenerator();

  const downloadSitemap = async () => {
    try {
      const sitemapXml = await generator.generateSitemap();
      
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      return sitemapXml;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  };

  const downloadRobotsTxt = async () => {
    try {
      const robotsTxt = await generator.generateRobotsTxt();
      
      const blob = new Blob([robotsTxt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'robots.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      return robotsTxt;
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      throw error;
    }
  };

  return {
    downloadSitemap,
    downloadRobotsTxt,
    generator
  };
}