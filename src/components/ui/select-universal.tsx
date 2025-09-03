import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectUniversalProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right';
}

export function SelectUniversal({
  value,
  onValueChange,
  options,
  placeholder = "Selecione uma opção",
  disabled = false,
  className,
  align = 'left'
}: SelectUniversalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Portal menu to body with intelligent positioning
    if (menuRef.current && containerRef.current) {
      const menu = menuRef.current;
      const trigger = containerRef.current;
      const rect = trigger.getBoundingClientRect();
      
      document.body.appendChild(menu);
      
      // Position intelligently
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const shouldOpenUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
      
      menu.style.position = 'fixed';
      menu.style.zIndex = '9999';
      menu.style.width = `${rect.width}px`;
      
      if (align === 'right') {
        menu.style.right = `${window.innerWidth - rect.right}px`;
      } else {
        menu.style.left = `${rect.left}px`;
      }
      
      if (shouldOpenUpward) {
        menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      } else {
        menu.style.top = `${rect.bottom + 8}px`;
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      
      // Clean up portal
      if (menuRef.current?.parentNode === document.body) {
        document.body.removeChild(menuRef.current);
      }
    };
  }, [isOpen, align]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange?.(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="dd relative"
      data-dd
      data-dd-open={isOpen}
      data-dd-align={align}
    >
      <button
        type="button"
        className={cn(
          "dd-trigger flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-muted-foreground",
          className
        )}
        data-dd-trigger
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown className="h-4 w-4" data-dd-icon />
      </button>

      <div
        ref={menuRef}
        className="dd-menu max-h-60 overflow-auto"
        data-dd-menu
        role="listbox"
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex w-full items-center px-3 py-2 text-sm text-left",
              "hover:bg-muted focus:bg-muted focus:outline-none",
              option.disabled && "opacity-50 cursor-not-allowed",
              option.value === value && "bg-accent text-accent-foreground"
            )}
            onClick={() => handleSelect(option)}
            disabled={option.disabled}
            role="option"
            aria-selected={option.value === value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}