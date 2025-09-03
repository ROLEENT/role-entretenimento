import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextType | null>(null);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({ value, defaultValue, onValueChange, onOpenChange, disabled, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen: handleOpenChange, 
      disabled 
    }}>
      <div className="dd relative" data-dd data-dd-open={open}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
  [key: string]: any; // Para aceitar props como aria-*
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const { open, setOpen, disabled } = context;

  return (
    <button
      type="button"
      className={cn(
        "dd-trigger flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-dd-trigger
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  const { value } = context;

  return (
    <span className={cn(!value && "text-muted-foreground", className)}>
      {value || placeholder}
    </span>
  );
}

interface SelectContentProps {
  className?: string;
  position?: string;
  children: React.ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  const { open, setOpen } = context;
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Find the parent Select container and portal the menu to body
    const selectContainer = menuRef.current?.closest('[data-dd]') as HTMLElement;
    if (menuRef.current && selectContainer) {
      const menu = menuRef.current;
      const rect = selectContainer.getBoundingClientRect();
      
      document.body.appendChild(menu);
      
      // Position intelligently
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const shouldOpenUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
      
      menu.style.position = 'fixed';
      menu.style.zIndex = '9999';
      menu.style.width = `${rect.width}px`;
      menu.style.left = `${rect.left}px`;
      
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
  }, [open, setOpen]);

  return (
    <div
      ref={menuRef}
      className={cn("dd-menu max-h-60 overflow-auto", className)}
      data-dd-menu
      role="listbox"
      style={{ display: open ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SelectItem({ value, disabled, className, children }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const { value: selectedValue, onValueChange, setOpen } = context;

  const handleSelect = () => {
    if (!disabled) {
      onValueChange?.(value);
      setOpen(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center px-3 py-2 text-sm text-left",
        "hover:bg-muted focus:bg-muted focus:outline-none",
        disabled && "opacity-50 cursor-not-allowed",
        value === selectedValue && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleSelect}
      disabled={disabled}
      role="option"
      aria-selected={value === selectedValue}
    >
      {children}
    </button>
  );
}

interface SelectLabelProps {
  className?: string;
  children: React.ReactNode;
}

export function SelectLabel({ className, children }: SelectLabelProps) {
  return (
    <div className={cn("px-3 py-2 text-sm font-medium text-muted-foreground", className)}>
      {children}
    </div>
  );
}

interface SelectSeparatorProps {
  className?: string;
}

export function SelectSeparator({ className }: SelectSeparatorProps) {
  return <hr className={cn("my-1 border-border", className)} />;
}

interface SelectGroupProps {
  children: React.ReactNode;
}

export function SelectGroup({ children }: SelectGroupProps) {
  return <div>{children}</div>;
}