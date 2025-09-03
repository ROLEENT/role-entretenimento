import { Card, CardContent } from "@/components/ui/card";

interface AdminEventFormProps {
  event?: any;
}

export function AdminEventForm({ event }: AdminEventFormProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Formulário de evento em desenvolvimento</p>
          <p className="text-sm mt-2">
            Este componente será implementado com a nova estrutura do banco de dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}