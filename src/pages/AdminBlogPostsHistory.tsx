import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Edit, Calendar, MapPin, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  city: string;
  author_name: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  scheduled_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  cover_image: string;
  summary: string;
}

const AdminBlogPostsHistory = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Histórico de Posts do Blog</h1>
        <p className="text-muted-foreground">
          Gerencie e visualize todos os posts publicados no blog
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

export default AdminBlogPostsHistory;