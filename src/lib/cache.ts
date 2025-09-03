import { QueryClient } from '@tanstack/react-query';

/**
 * Cache otimizado para busca de venues, artistas e organizadores
 */
export class SearchCache {
  private static instance: SearchCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance() {
    if (!SearchCache.instance) {
      SearchCache.instance = new SearchCache();
    }
    return SearchCache.instance;
  }

  private getCacheKey(type: string, query: string): string {
    return `${type}:${query.toLowerCase().trim()}`;
  }

  set(type: string, query: string, data: any, ttl = 300000): void { // 5 minutos padrão
    const key = this.getCacheKey(type, query);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(type: string, query: string): any | null {
    const key = this.getCacheKey(type, query);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(type?: string): void {
    if (type) {
      // Limpar apenas um tipo
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${type}:`))
        .forEach(key => this.cache.delete(key));
    } else {
      // Limpar tudo
      this.cache.clear();
    }
  }

  // Limpeza automática de itens expirados
  cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

/**
 * Hook para cache de busca com React Query
 */
export const createSearchQueries = (queryClient: QueryClient) => ({
  venues: {
    search: (query: string) => ({
      queryKey: ['venues', 'search', query],
      queryFn: async () => {
        const cache = SearchCache.getInstance();
        const cached = cache.get('venues', query);
        if (cached) return cached;

        // Implementar busca real aqui
        const results = []; // await searchVenues(query);
        cache.set('venues', query, results);
        return results;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      enabled: query.length >= 2
    })
  },

  artists: {
    search: (query: string) => ({
      queryKey: ['artists', 'search', query],
      queryFn: async () => {
        const cache = SearchCache.getInstance();
        const cached = cache.get('artists', query);
        if (cached) return cached;

        // Implementar busca real aqui
        const results = []; // await searchArtists(query);
        cache.set('artists', query, results);
        return results;
      },
      staleTime: 5 * 60 * 1000,
      enabled: query.length >= 2
    })
  },

  organizers: {
    search: (query: string) => ({
      queryKey: ['organizers', 'search', query],
      queryFn: async () => {
        const cache = SearchCache.getInstance();
        const cached = cache.get('organizers', query);
        if (cached) return cached;

        // Implementar busca real aqui
        const results = []; // await searchOrganizers(query);
        cache.set('organizers', query, results);
        return results;
      },
      staleTime: 5 * 60 * 1000,
      enabled: query.length >= 2
    })
  }
});

// Limpeza automática a cada 10 minutos
setInterval(() => {
  SearchCache.getInstance().cleanup();
}, 10 * 60 * 1000);