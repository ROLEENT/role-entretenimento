"use client";
import { Link, useLocation } from "react-router-dom";
import { DetailsDropdown } from "@/components/ui/details-dropdown";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { 
  href: string; 
  title: string; 
  description?: string; 
  icon?: LucideIcon; 
};

interface MegaMenuProps {
  label: string;
  items: readonly Item[];
  basePath?: string; // Para determinar se o menu está ativo
}

export function MegaMenu({ label, items, basePath }: MegaMenuProps) {
  const location = useLocation();
  const isActive = basePath ? location.pathname.startsWith(basePath) : false;

  return (
    <div className="dd" data-dd>
      <button 
        className={`dd-trigger inline-flex items-center gap-1.5 h-9 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          isActive 
            ? 'text-foreground bg-muted/70' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
        data-dd-trigger 
        aria-expanded="false"
      >
        {label}
        <ChevronDown className="h-3 w-3" data-dd-icon />
      </button>
      
      <div className="dd-menu w-[360px]" data-dd-menu role="menu">
        {items.map(item => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              role="menuitem"
              className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span className="font-medium">{item.title}</span>
              </div>
              {item.description && (
                <span className="text-sm text-muted-foreground">{item.description}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}