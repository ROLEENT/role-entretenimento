import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RoleNoticeConfig {
  whatsNumber?: string;
  snoozeDays?: number;
  excludePaths?: string[];
}

const DEFAULT_CONFIG: Required<RoleNoticeConfig> = {
  whatsNumber: '5551999999999',
  snoozeDays: 7,
  excludePaths: [
    '/politica-privacidade',
    '/politica-spam', 
    '/termos-usuario',
    '/termos-organizador',
    '/institucional/imprensa'
  ]
};

const STORAGE_KEY = 'role_site_notice_snooze_until_v1';

export const useRoleNotice = (config: RoleNoticeConfig = {}) => {
  const [showNotice, setShowNotice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check if current path should be excluded
  const shouldExcludePath = () => {
    return finalConfig.excludePaths.some(path => 
      location.pathname.startsWith(path)
    );
  };

  // Check if notice is snoozed
  const isNoticeSnoozed = () => {
    try {
      const snoozeUntil = localStorage.getItem(STORAGE_KEY);
      if (!snoozeUntil) return false;
      
      const snoozeDate = new Date(snoozeUntil);
      return snoozeDate > new Date();
    } catch {
      return false;
    }
  };

  // Set snooze period
  const snoozeNotice = () => {
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + finalConfig.snoozeDays);
      localStorage.setItem(STORAGE_KEY, snoozeUntil.toISOString());
      
      // Dispatch telemetry event
      document.dispatchEvent(new CustomEvent('role:notice_snooze', {
        detail: { snoozeDays: finalConfig.snoozeDays }
      }));
      
      closeNotice();
    } catch {
      // Fallback if localStorage fails
      closeNotice();
    }
  };

  // Close notice without snoozing
  const closeNotice = () => {
    setIsVisible(false);
    setTimeout(() => setShowNotice(false), 300);
    
    // Dispatch telemetry event
    document.dispatchEvent(new CustomEvent('role:notice_dismiss'));
  };

  // Generate WhatsApp link
  const getWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Olá! Encontrei algo no site do ROLÊ.\n\n` +
      `Página: ${window.location.href}\n` +
      `Dispositivo: ${navigator.userAgent}\n\n` +
      `O que aconteceu: `
    );
    
    return `https://wa.me/${finalConfig.whatsNumber}?text=${message}`;
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    // Dispatch telemetry event
    document.dispatchEvent(new CustomEvent('role:notice_whats_click', {
      detail: { page: window.location.href }
    }));
    
    window.open(getWhatsAppLink(), '_blank');
    closeNotice();
  };

  // Check if notice should be shown
  useEffect(() => {
    if (shouldExcludePath() || isNoticeSnoozed()) {
      return;
    }

    // Show notice after a brief delay
    const timer = setTimeout(() => {
      setShowNotice(true);
      setTimeout(() => {
        setIsVisible(true);
        
        // Dispatch telemetry event
        document.dispatchEvent(new CustomEvent('role:notice_shown', {
          detail: { page: window.location.href }
        }));
      }, 100);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    showNotice,
    isVisible,
    closeNotice,
    snoozeNotice,
    handleWhatsAppClick
  };
};