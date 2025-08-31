"use client";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className={`inline-flex items-center gap-1.5 h-9 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          isActive 
            ? 'text-foreground bg-muted/70' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}>
          {label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="bottom" 
        align="start" 
        sideOffset={8} 
        className="z-[60] w-[360px] p-3"
      >
        <div className="space-y-1">
          {items.map((item) => {
            const isItemActive = location.pathname === item.href;
            return (
              <DropdownMenuItem asChild key={item.href} className="p-0">
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md p-3 transition-colors cursor-pointer no-underline ${
                    isItemActive
                      ? 'bg-muted text-foreground font-medium'
                      : 'hover:bg-muted/70'
                  }`}
                >
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    {item.icon ? <item.icon className="h-4 w-4" /> : "📄"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    {item.description && (
                      <div className="truncate text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}