import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventMoodTagsCardProps {
  event: any;
}

export function EventMoodTagsCard({ event }: EventMoodTagsCardProps) {
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const hasGenres = event.genres && event.genres.length > 0;
  const hasTags = event.tags && event.tags.length > 0;
  
  if (!hasGenres && !hasTags) return null;

  const INITIAL_DISPLAY_COUNT = 6;

  const displayedGenres = showAllGenres 
    ? event.genres 
    : event.genres?.slice(0, INITIAL_DISPLAY_COUNT) || [];
    
  const displayedTags = showAllTags 
    ? event.tags 
    : event.tags?.slice(0, INITIAL_DISPLAY_COUNT) || [];

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Music2 className="h-5 w-5 text-primary" />
          Mood / Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood/Genres Section */}
        {hasGenres && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Mood
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedGenres.map((genre: string, index: number) => (
                <Link 
                  key={index}
                  to={`/agenda?genre=${encodeURIComponent(genre)}`}
                  className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
            
            {event.genres.length > INITIAL_DISPLAY_COUNT && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAllGenres(!showAllGenres)}
                className="mt-2 text-muted-foreground hover:text-foreground"
              >
                {showAllGenres ? (
                  <>
                    Ver menos <ChevronUp className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Ver mais {event.genres.length - INITIAL_DISPLAY_COUNT} 
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        
        {/* Tags Section */}
        {hasTags && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayedTags.map((tag: string, index: number) => (
                <Link 
                  key={index}
                  to={`/agenda?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 border border-border bg-background rounded-full text-sm font-medium cursor-pointer hover:bg-muted transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            
            {event.tags.length > INITIAL_DISPLAY_COUNT && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAllTags(!showAllTags)}
                className="mt-2 text-muted-foreground hover:text-foreground"
              >
                {showAllTags ? (
                  <>
                    Ver menos <ChevronUp className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    Ver mais {event.tags.length - INITIAL_DISPLAY_COUNT} 
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}