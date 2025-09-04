import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventBreadcrumbProps {
  event: any;
}

export function EventBreadcrumb({ event }: EventBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link 
            to="/" 
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            Início
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link 
            to={`/agenda?city=${encodeURIComponent(event.city)}`}
            className="hover:text-foreground transition-colors"
          >
            {event.city}
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {event.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}