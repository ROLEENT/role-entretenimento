import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, BookOpen, Mail } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Novo Evento</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Ver Agenda</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span className="text-sm">Agentes</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm">Revista</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Mail className="h-6 w-6" />
            <span className="text-sm">Contatos</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}