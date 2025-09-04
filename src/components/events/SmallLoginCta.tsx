import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export function SmallLoginCta() {
  return (
    <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed max-h-[120px]">
      <div className="text-center">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Faça login para ver e participar da conversa
        </p>
        <Link 
          to="/auth" 
          className="text-sm text-primary hover:underline"
        >
          Entrar para comentar
        </Link>
      </div>
    </div>
  );
}