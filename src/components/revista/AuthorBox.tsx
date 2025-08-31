import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Twitter, Instagram, Linkedin } from "lucide-react";

interface AuthorBoxProps {
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    website?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export function AuthorBox({ author }: AuthorBoxProps) {
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{author.name}</h3>
            {author.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {author.bio}
              </p>
            )}
            
            {(author.website || author.twitter || author.instagram || author.linkedin) && (
              <div className="flex flex-wrap gap-2">
                {author.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={author.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      Website
                    </a>
                  </Button>
                )}
                
                {author.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://twitter.com/${author.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <Twitter className="h-3 w-3" />
                      Twitter
                    </a>
                  </Button>
                )}
                
                {author.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://instagram.com/${author.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <Instagram className="h-3 w-3" />
                      Instagram
                    </a>
                  </Button>
                )}
                
                {author.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={author.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}