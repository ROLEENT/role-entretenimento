// Sistema universal de dropdown - migrado para data-dd
// Componentes mantidos para compatibilidade, mas redirecionam para sistema universal

import React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: string;
  className?: string;
  forceMount?: boolean;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
  className?: string;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="dd" data-dd>{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  if (asChild) return <>{children}</>;
  return <div className="dd-trigger" data-dd-trigger>{children}</div>;
}

export function DropdownMenuContent({ children, align, className, forceMount }: DropdownMenuContentProps) {
  return (
    <div className={`dd-menu ${className || ''}`} data-dd-menu role="menu" data-dd-align={align}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, asChild, onClick, className }: DropdownMenuItemProps) {
  if (asChild) return <>{children}</>;
  return (
    <button role="menuitem" onClick={onClick} className={`w-full text-left ${className || ''}`}>
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return <div className={`px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border ${className || ''}`}>{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="border-t border-border my-1"></div>;
}