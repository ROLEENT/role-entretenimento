import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface DiagnosticInfo {
  component: string;
  version: string;
  timestamp: string;
  route: string;
  userAgent: string;
  cacheKey?: string;
}

export function AdminV3DiagnosticPanel() {
  const [isVisible, setIsVisible] = useState(true);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    component: "AdminV3EventCreate",
    version: "v3-wizard-2024",
    timestamp: new Date().toISOString(),
    route: window.location.pathname,
    userAgent: navigator.userAgent.substring(0, 50) + "...",
    cacheKey: `admin-v3-${Date.now()}`
  });

  const handleClearCache = () => {
    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force reload
    window.location.reload();
  };

  const handleRefreshDiagnostics = () => {
    setDiagnostics(prev => ({
      ...prev,
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
      cacheKey: `admin-v3-${Date.now()}`
    }));
  };

  useEffect(() => {
    console.log("🔍 Diagnostic Panel Loaded", diagnostics);
  }, [diagnostics]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          🔍 Diagnóstico Admin V3
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✅ NOVO
          </Badge>
          <span>Formulário Wizard v3</span>
        </div>
        
        <div className="space-y-1 text-muted-foreground">
          <div><strong>Componente:</strong> {diagnostics.component}</div>
          <div><strong>Versão:</strong> {diagnostics.version}</div>
          <div><strong>Rota:</strong> {diagnostics.route}</div>
          <div><strong>Cache Key:</strong> {diagnostics.cacheKey}</div>
          <div><strong>Timestamp:</strong> {new Date(diagnostics.timestamp).toLocaleTimeString()}</div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshDiagnostics}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            className="flex-1"
          >
            Clear Cache
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-2 mt-2">
          <div className="text-yellow-700 dark:text-yellow-300 text-xs">
            <strong>🚨 Se você ainda vê o formulário antigo:</strong>
            <br />1. Clique em "Clear Cache"
            <br />2. Pressione Ctrl+F5 (hard refresh)
            <br />3. Verifique se está na rota correta
          </div>
        </div>
      </CardContent>
    </Card>
  );
}