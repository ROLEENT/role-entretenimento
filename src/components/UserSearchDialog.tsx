import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useFollow } from '@/hooks/useFollow';
import { UserCard } from '@/components/UserCard';

interface UserSearchDialogProps {
  children: React.ReactNode;
  onUserSelect?: (userId: string) => void;
}

export const UserSearchDialog = ({ children, onUserSelect }: UserSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { results, loading, searchUsers } = useUserSearch();
  const { toggleFollow } = useFollow();

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, searchUsers]);

  const handleUserClick = (userId: string) => {
    onUserSelect?.(userId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Usuários
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Digite o nome de usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && searchTerm && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado</p>
                <p className="text-sm">Tente buscar com termos diferentes</p>
              </div>
            )}

            {results.map((user) => (
              <div key={user.user_id} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <UserCard
                  user={user}
                  onClick={() => handleUserClick(user.user_id)}
                  showFollowButton={true}
                />
              </div>
            ))}

            {!searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Digite para buscar usuários</p>
                <p className="text-sm">Encontre pessoas para seguir</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};