import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/features/profiles/api';

interface VenueGalleryProps {
  profile: Profile;
}

export function VenueGallery({ profile }: VenueGalleryProps) {
  // Mock gallery data - replace with real gallery images
  const galleryImages = [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg'
  ];

  if (!galleryImages.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div 
              key={index}
              className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img 
                src={image} 
                alt={`${profile.name} - Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}