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

  const dropdownItems = items.map(item => ({
    label: item.title,
    href: item.href,
    icon: item.icon,
    description: item.description,
  }));

  return (
    <DetailsDropdown
      trigger={
        <span className={`inline-flex items-center gap-1.5 h-9 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          isActive 
            ? 'text-foreground bg-muted/70' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}>
          {label}
          <ChevronDown className="h-3 w-3" />
        </span>
      }
      items={dropdownItems}
      menuClassName="w-[360px]"
      align="start"
    />
  );
}