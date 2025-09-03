"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  value?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface DetailsDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  menuClassName?: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
  disabled?: boolean;
  variant?: 'menu' | 'icon' | 'button';
  'aria-label'?: string;
}

export function DetailsDropdown({
  trigger,
  items,
  className,
  menuClassName,
  triggerClassName,
  align = 'start',
  disabled = false,
  variant = 'menu',
  'aria-label': ariaLabel,
}: DetailsDropdownProps) {
  const summaryClass = variant === 'icon' ? 'dd-icon' : 'dd-trigger';

  return (
    <div className={cn("dd", className)}>
      <details>
        <summary
          className={cn(summaryClass, triggerClassName)}
          aria-label={ariaLabel}
          style={{ pointerEvents: disabled ? 'none' : 'auto' }}
        >
          {trigger}
        </summary>
        <div
          className={cn(
            "dd-menu",
            align === 'end' && 'right-0 left-auto',
            menuClassName
          )}
          role="menu"
        >
          {items.map((item, index) => {
            const IconComponent = item.icon;
            
            if (item.href) {
              return (
                <a
                  key={index}
                  href={item.href}
                  role="menuitem"
                  className={cn(
                    "dd-item",
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                </a>
              );
            }

            return (
              <button
                key={index}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "dd-item",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}