import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminEventCreate = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Evento</h1>
        <p className="text-muted-foreground">
          Adicione novos eventos à plataforma
        </p>
      </div>
      
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Funcionalidade em desenvolvimento
        </p>
        <Link to="/admin">
          <Button className="mt-4">Voltar ao Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminEventCreate;