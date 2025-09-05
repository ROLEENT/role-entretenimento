import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceSettings {
  lgpd_enabled: boolean;
  gdpr_enabled: boolean;
  cookie_consent_required: boolean;
  data_retention_days: number;
  privacy_policy_version: string;
  csp_enabled: boolean;
  security_headers_enabled: boolean;
}

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

export function useCompliance() {
  const [settings, setSettings] = useState<ComplianceSettings>({
    lgpd_enabled: true,
    gdpr_enabled: true,
    cookie_consent_required: true,
    data_retention_days: 730,
    privacy_policy_version: '1.0',
    csp_enabled: true,
    security_headers_enabled: true,
  });
  
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceSettings();
    loadCookieConsent();
  }, []);

  const loadComplianceSettings = async () => {
    try {
      const { data } = await supabase
        .from('compliance_settings')
        .select('*');

      if (data) {
        const settingsMap: Partial<ComplianceSettings> = {};
        data.forEach(item => {
          const key = item.setting_key as keyof ComplianceSettings;
          const value = typeof item.setting_value === 'string' 
            ? JSON.parse(item.setting_value)
            : item.setting_value;
          
          // Type safe assignment
          if (key in settings) {
            (settingsMap as any)[key] = value;
          }
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCookieConsent = () => {
    const saved = localStorage.getItem('cookie-consent');
    const timestamp = localStorage.getItem('consent-timestamp');
    
    if (saved && timestamp) {
      const consent = JSON.parse(saved);
      setCookieConsent({
        ...consent,
        timestamp: parseInt(timestamp)
      });
    }
  };

  const updateCookieConsent = (consent: Omit<CookieConsent, 'timestamp'>) => {
    const timestampedConsent: CookieConsent = {
      ...consent,
      timestamp: Date.now()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    localStorage.setItem('consent-timestamp', timestampedConsent.timestamp.toString());
    setCookieConsent(timestampedConsent);
    
    // Log evento de compliance
    logComplianceEvent('cookie_consent_updated', {
      consent,
      timestamp: timestampedConsent.timestamp
    });
  };

  const hasValidConsent = (): boolean => {
    if (!settings.cookie_consent_required) return true;
    if (!cookieConsent) return false;
    
    // Verificar se o consentimento não expirou (1 ano)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return (Date.now() - cookieConsent.timestamp) < oneYear;
  };

  const canUseAnalytics = (): boolean => {
    return hasValidConsent() && (cookieConsent?.analytics ?? false);
  };

  const canUseMarketing = (): boolean => {
    return hasValidConsent() && (cookieConsent?.marketing ?? false);
  };

  const canUsePreferences = (): boolean => {
    return hasValidConsent() && (cookieConsent?.preferences ?? false);
  };

  const logComplianceEvent = async (eventType: string, data: any) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_details: data,
        p_severity: 'info'
      });
    } catch (error) {
      console.error('Erro ao registrar evento de compliance:', error);
    }
  };

  const requestDataDeletion = async (userEmail: string, reason: string) => {
    try {
      await logComplianceEvent('data_deletion_request', {
        user_email: userEmail,
        reason,
        requested_at: new Date().toISOString()
      });
      
      // Aqui você implementaria a lógica real de deleção
      // Por agora, apenas registramos a solicitação
      
      return { success: true, message: 'Solicitação de exclusão registrada' };
    } catch (error) {
      console.error('Erro ao solicitar exclusão de dados:', error);
      return { success: false, message: 'Erro ao processar solicitação' };
    }
  };

  const exportUserData = async (userEmail: string) => {
    try {
      await logComplianceEvent('data_export_request', {
        user_email: userEmail,
        requested_at: new Date().toISOString()
      });
      
      // Aqui você implementaria a lógica real de exportação
      // Por agora, apenas registramos a solicitação
      
      return { success: true, message: 'Exportação de dados iniciada' };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return { success: false, message: 'Erro ao processar exportação' };
    }
  };

  const isDataRetentionExpired = (createdAt: string): boolean => {
    if (!settings.data_retention_days) return false;
    
    const createdDate = new Date(createdAt);
    const retentionPeriod = settings.data_retention_days * 24 * 60 * 60 * 1000;
    
    return (Date.now() - createdDate.getTime()) > retentionPeriod;
  };

  return {
    settings,
    cookieConsent,
    loading,
    hasValidConsent,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
    updateCookieConsent,
    requestDataDeletion,
    exportUserData,
    isDataRetentionExpired,
    logComplianceEvent
  };
}