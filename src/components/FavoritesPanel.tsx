import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import EventCard from './EventCard';

interface FavoritesPanelProps {
  className?: string;
}

const FavoritesPanel = ({ className }: FavoritesPanelProps) => {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Seus Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Você ainda não tem eventos favoritos
            </p>
            <p className="text-sm text-muted-foreground">
              Clique no ❤️ em qualquer evento para salvá-lo aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-destructive text-destructive" />
          Seus Favoritos ({favorites.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((event) => (
            <EventCard
              key={event.id}
              event={{ ...event, price: 0 }}
              className="h-fit"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoritesPanel;