import React from 'react';
import { AgendaFormChecklist } from '@/components/agenda/AgendaFormChecklist';

export default function ChecklistTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">📋 Checklist Automatizável</h1>
          <p className="text-muted-foreground">
            Verificação automática das funcionalidades do AgendaForm
          </p>
        </div>
        
        <AgendaFormChecklist />
        
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="font-semibold text-amber-800 mb-3">📝 Itens do Checklist Implementados:</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-700">
            <div className="space-y-2">
              <p><strong>✅ Salvar rascunho:</strong> Só exige title + slug</p>
              <p><strong>✅ Validação publicação:</strong> Capa, alt, cidade, datas, 15min</p>
              <p><strong>✅ Occurrences & Tiers:</strong> 2 de cada inicializados</p>
              <p><strong>✅ Storage upload:</strong> Bucket 'agenda-images' com RLS</p>
            </div>
            <div className="space-y-2">
              <p><strong>✅ Duplicação:</strong> Novo slug-2, sem mídia</p>
              <p><strong>✅ Slug history:</strong> Registro em agenda_slug_history</p>
              <p><strong>✅ Remoção storage:</strong> Cleanup automático</p>
              <p><strong>✅ Select values:</strong> Nunca value="" vazio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}