import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, ExternalLink } from 'lucide-react';

interface EventLinksCardProps {
  event: any;
  partners: any[];
}

export function EventLinksCard({ event, partners }: EventLinksCardProps) {
  // Collect all links from event and partners
  const getAllLinks = () => {
    const links: Array<{ label: string; url: string; icon: any }> = [];
    
    // Event links from links object
    if (event.links) {
      Object.entries(event.links).forEach(([key, url]) => {
        if (url && typeof url === 'string') {
          let label = key;
          let icon = ExternalLink;
          
          // Map common link types
          if (key.toLowerCase().includes('site') || key.toLowerCase().includes('website')) {
            label = 'Site';
            icon = Globe;
          } else if (key.toLowerCase().includes('instagram')) {
            label = 'Instagram';
            icon = Instagram;
          }
          
          links.push({ label, url, icon });
        }
      });
    }
    
    // Event external_links array
    if (event.external_links && Array.isArray(event.external_links)) {
      event.external_links.forEach((link: any) => {
        if (link.url) {
          let icon = ExternalLink;
          
          if (link.label?.toLowerCase().includes('site') || link.label?.toLowerCase().includes('website')) {
            icon = Globe;
          } else if (link.label?.toLowerCase().includes('instagram')) {
            icon = Instagram;
          }
          
          links.push({ 
            label: link.label || 'Link', 
            url: link.url, 
            icon 
          });
        }
      });
    }
    
    // Partner social links
    partners?.forEach(partnerData => {
      const partner = partnerData.partners;
      if (partner) {
        if (partner.website) {
          links.push({
            label: `Site - ${partner.name}`,
            url: partner.website,
            icon: Globe
          });
        }
        
        if (partner.instagram) {
          links.push({
            label: `Instagram - ${partner.name}`,
            url: partner.instagram,
            icon: Instagram
          });
        }
      }
    });
    
    return links;
  };

  const allLinks = getAllLinks();

  if (allLinks.length === 0) return null;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5 text-primary" />
          Links Oficiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allLinks.map((link, index) => {
          const IconComponent = link.icon;
          
          return (
            <Button 
              key={index}
              asChild 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
            >
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                <span className="truncate">{link.label}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </a>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}