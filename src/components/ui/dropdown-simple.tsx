"use client";

import React, { useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initialize dropdown functionality
    const dropdown = dropdownRef.current;
    const triggerEl = triggerRef.current;
    
    if (!dropdown || !triggerEl) return;

    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('is-open');
      triggerEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      
      if (isOpen) {
        // Close other dropdowns
        document.querySelectorAll('[data-dropdown].is-open').forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('is-open');
            const t = d.querySelector('[data-dropdown-trigger]') as HTMLButtonElement;
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        triggerEl.setAttribute('aria-expanded', 'false');
        triggerEl.focus();
      }
    };

    const handleMouseLeave = () => {
      if (isPointerFine) {
        dropdown.classList.remove('is-open');
        triggerEl.setAttribute('aria-expanded', 'false');
      }
    };

    triggerEl.addEventListener('click', handleClick);
    dropdown.addEventListener('keydown', handleKeydown);
    
    if (isPointerFine) {
      dropdown.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      triggerEl.removeEventListener('click', handleClick);
      dropdown.removeEventListener('keydown', handleKeydown);
      if (isPointerFine) {
        dropdown.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const menuId = `dropdown-menu-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      ref={dropdownRef}
      className={cn("relative", className)} 
      data-dropdown
    >
      <button
        ref={triggerRef}
        className={cn(
          "bg-transparent border-0 p-2 font-inherit cursor-pointer",
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
          "absolute top-full min-w-[220px] hidden p-2",
          "border border-border bg-popover text-popover-foreground shadow-lg rounded-md z-50",
          align === 'end' ? 'right-0' : 'left-0',
          "[.is-open>&]:block",
          "[@media(hover:hover)and(pointer:fine)]:group-hover:block",
          "group-focus-within:block",
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
                "block p-2 text-sm text-foreground no-underline rounded-sm",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
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
                "w-full text-left block p-2 text-sm text-foreground rounded-sm border-0 bg-transparent cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
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