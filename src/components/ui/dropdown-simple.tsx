"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  value: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  menuClassName?: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
  disabled?: boolean;
  'aria-label'?: string;
}

export function SimpleDropdown({
  trigger,
  items,
  className,
  menuClassName,
  triggerClassName,
  align = 'start',
  disabled = false,
  'aria-label': ariaLabel,
}: SimpleDropdownProps) {
  const menuId = `dropdown-menu-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      className={cn("dropdown", className)} 
      data-dropdown
    >
      <button
        className={cn(
          "dropdown-trigger",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
        data-dropdown-trigger
        aria-expanded="false"
        aria-controls={menuId}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {trigger}
      </button>
      
      <div
        id={menuId}
        className={cn(
          "dropdown-menu",
          align === 'end' ? 'right-0' : 'left-0',
          menuClassName
        )}
        data-dropdown-menu
        role="menu"
      >
        {items.map((item, index) => (
          item.href ? (
            <a
              key={index}
              href={item.href}
              role="menuitem"
              className={cn(
                "block p-2 text-sm no-underline rounded-sm",
                item.disabled && "opacity-50 pointer-events-none"
              )}
            >
              {item.label}
            </a>
          ) : (
            <button
              key={index}
              role="menuitem"
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "w-full text-left block p-2 text-sm rounded-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {item.label}
            </button>
          )
        ))}
      </div>
    </div>
  );
}