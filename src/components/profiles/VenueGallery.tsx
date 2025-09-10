import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/features/profiles/api';
import { useProfileMedia } from '@/features/profiles/hooks/useProfileMedia';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface VenueGalleryProps {
  profile: Profile;
}

export function VenueGallery({ profile }: VenueGalleryProps) {
  const { data: mediaItems, isLoading, error } = useProfileMedia(profile.user_id || '');
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Galeria</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !mediaItems?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaItems.map((media) => (
            <div 
              key={media.id}
              className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {media.type === 'image' ? (
                <img 
                  src={media.url} 
                  alt={media.alt_text || `${profile.name} - Galeria`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={media.url} 
                  className="w-full h-full object-cover"
                  muted
                  controls={false}
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              )}
              {media.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-sm">{media.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}