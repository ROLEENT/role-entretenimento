import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventBreadcrumbProps {
  event: any;
}

export function EventBreadcrumb({ event }: EventBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 px-4 max-w-[680px] mx-auto">
      <ol className="flex items-center space-x-1 text-xs opacity-80 gap-1">
        <li>
          <Link 
            to="/" 
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Início
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-3 w-3" />
          <Link 
            to={`/agenda?city=${encodeURIComponent(event.city)}`}
            className="hover:text-foreground transition-colors"
          >
            {event.city}
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight className="h-3 w-3" />
          <span 
            className="text-foreground font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px] md:max-w-[200px]"
            aria-label={event.title}
            title={event.title}
          >
            {event.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}