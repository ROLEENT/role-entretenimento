import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfiguration {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
}

export interface SEOConfiguration {
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  canonical_url: string;
  robots: string;
  sitemap_enabled: boolean;
  analytics_id: string;
}

export interface SecurityConfiguration {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  session_timeout: number;
  max_login_attempts: number;
  enable_2fa: boolean;
  cors_origins: string[];
  rate_limiting: {
    enabled: boolean;
    requests_per_minute: number;
  };
}

export const useAdvancedSettings = () => {
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [seoConfig, setSeoConfig] = useState<SEOConfiguration | null>(null);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from a system_configurations table
      const mockConfigurations: SystemConfiguration[] = [
        {
          id: '1',
          category: 'general',
          key: 'site_name',
          value: 'ROLÊ',
          description: 'Nome do site exibido no cabeçalho',
          type: 'string',
          is_sensitive: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          category: 'general',
          key: 'max_events_per_page',
          value: 20,
          description: 'Número máximo de eventos por página',
          type: 'number',
          is_sensitive: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          category: 'features',
          key: 'enable_comments',
          value: true,
          description: 'Permitir comentários nos eventos',
          type: 'boolean',
          is_sensitive: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          category: 'features',
          key: 'enable_push_notifications',
          value: true,
          description: 'Ativar notificações push',
          type: 'boolean',
          is_sensitive: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          category: 'performance',
          key: 'cache_duration',
          value: 300,
          description: 'Duração do cache em segundos',
          type: 'number',
          is_sensitive: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setConfigurations(mockConfigurations);
      
      // Mock SEO configuration
      setSeoConfig({
        meta_title: 'ROLÊ - Descubra os melhores eventos da sua cidade',
        meta_description: 'A plataforma definitiva para descobrir eventos incríveis na sua cidade. Música, cultura, gastronomia e muito mais.',
        meta_keywords: ['eventos', 'música', 'cultura', 'entretenimento', 'cidade'],
        og_title: 'ROLÊ - Eventos na sua cidade',
        og_description: 'Descubra os melhores eventos da sua cidade no ROLÊ',
        og_image: '/banner-home.png',
        twitter_title: 'ROLÊ - Eventos na sua cidade',
        twitter_description: 'Descubra os melhores eventos da sua cidade no ROLÊ',
        twitter_image: '/banner-home.png',
        canonical_url: 'https://role.com.br',
        robots: 'index, follow',
        sitemap_enabled: true,
        analytics_id: 'GA_MEASUREMENT_ID'
      });
      
      // Mock security configuration
      setSecurityConfig({
        password_policy: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: false
        },
        session_timeout: 86400, // 24 hours in seconds
        max_login_attempts: 5,
        enable_2fa: false,
        cors_origins: ['https://role.com.br', 'https://www.role.com.br'],
        rate_limiting: {
          enabled: true,
          requests_per_minute: 100
        }
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (configId: string, newValue: any) => {
    try {
      setConfigurations(prev => 
        prev.map(config => 
          config.id === configId 
            ? { ...config, value: newValue, updated_at: new Date().toISOString() }
            : config
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  const updateSEOConfiguration = async (newSeoConfig: Partial<SEOConfiguration>) => {
    try {
      setSeoConfig(prev => prev ? { ...prev, ...newSeoConfig } : null);
      
      toast({
        title: "Sucesso",
        description: "Configurações de SEO atualizadas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações de SEO",
        variant: "destructive",
      });
    }
  };

  const updateSecurityConfiguration = async (newSecurityConfig: Partial<SecurityConfiguration>) => {
    try {
      setSecurityConfig(prev => prev ? { ...prev, ...newSecurityConfig } : null);
      
      toast({
        title: "Sucesso",
        description: "Configurações de segurança atualizadas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações de segurança",
        variant: "destructive",
      });
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      
      // Simulate backup creation
      const backupData = {
        configurations,
        seo_config: seoConfig,
        security_config: securityConfig,
        created_at: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-configuracoes-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Backup das configurações criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupFile: File) => {
    try {
      setLoading(true);
      
      const fileContent = await backupFile.text();
      const backupData = JSON.parse(fileContent);
      
      if (backupData.configurations) {
        setConfigurations(backupData.configurations);
      }
      if (backupData.seo_config) {
        setSeoConfig(backupData.seo_config);
      }
      if (backupData.security_config) {
        setSecurityConfig(backupData.security_config);
      }
      
      toast({
        title: "Sucesso",
        description: "Backup restaurado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao restaurar backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfigurationsByCategory = (category: string) => {
    return configurations.filter(config => config.category === category);
  };

  const getCategories = () => {
    const categories = [...new Set(configurations.map(config => config.category))];
    return categories.map(category => ({
      key: category,
      label: getCategoryLabel(category)
    }));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general': return 'Geral';
      case 'features': return 'Funcionalidades';
      case 'performance': return 'Performance';
      case 'seo': return 'SEO';
      case 'security': return 'Segurança';
      case 'integrations': return 'Integrações';
      default: return category;
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    seoConfig,
    securityConfig,
    loading,
    activeCategory,
    setActiveCategory,
    updateConfiguration,
    updateSEOConfiguration,
    updateSecurityConfiguration,
    createBackup,
    restoreBackup,
    getConfigurationsByCategory,
    getCategories,
    refreshConfigurations: fetchConfigurations
  };
};