import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/features/profiles/api';
import { HoverLift, TapScale } from '@/components/ui/micro-interactions';
import { LazyImage } from '@/components/performance/LazyImage';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: Profile;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function ProfileCard({ 
  profile, 
  onClick, 
  className,
  variant = 'default' 
}: ProfileCardProps) {
  const isClickable = !!onClick;

  const cardContent = (
    <Card className={cn(
      'overflow-hidden cursor-pointer group',
      'border-border/50 hover:border-border transition-colors',
      className
    )}>
      <div className="relative aspect-video">
        <LazyImage
          src={profile.cover_url || '/placeholder.svg'}
          alt={`Capa de ${profile.name}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Profile avatar */}
        <div className="absolute bottom-4 left-4">
          <div className="relative">
            <LazyImage
              src={profile.avatar_url || '/placeholder.svg'}
              alt={profile.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            {profile.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-primary-foreground fill-current" />
              </div>
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {profile.type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {profile.name}
          </h3>
          
          {profile.handle && (
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          )}
        </div>

        {profile.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{profile.city}</span>
          </div>
        )}

        {variant === 'detailed' && profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>
        )}

        {variant !== 'compact' && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{profile.followers_count || 0} seguidores</span>
            <span>⭐ {Math.round((Math.random() * 2 + 3) * 10) / 10}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isClickable) {
    return (
      <TapScale>
        <HoverLift intensity="medium">
          <div onClick={onClick} role="button" tabIndex={0}>
            {cardContent}
          </div>
        </HoverLift>
      </TapScale>
    );
  }

  return cardContent;
}