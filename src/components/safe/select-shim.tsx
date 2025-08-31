"use client";
import React from "react";

type SelectRootProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  defaultValue?: string;
  onOpenChange?: (open: boolean) => Promise<void> | void;
};

function collect(children: React.ReactNode) {
  const items: { value: string; label: React.ReactNode }[] = [];
  let placeholder: string | undefined;

  const walk = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      const name = (child.type as any).displayName;
      if (name === "SelectItem") {
        items.push({ value: child.props.value, label: child.props.children });
      } else if (name === "SelectValue") {
        placeholder = child.props.placeholder;
      }
      if (child.props?.children) walk(child.props.children);
    });
  };
  walk(children);
  return { items, placeholder };
}

export function Select({ value, onValueChange, disabled, className, children, defaultValue, onOpenChange }: SelectRootProps) {
  const { items, placeholder } = collect(children);
  return (
    <select
      className={`h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary ${className ?? ""}`}
      value={value ?? defaultValue ?? ""}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      aria-label={placeholder ?? "Selecionar"}
    >
      <option value="" disabled>{placeholder ?? "Selecione"}</option>
      {items.map((i) => (
        <option key={i.value} value={i.value}>{i.label}</option>
      ))}
    </select>
  );
}
Select.displayName = "Select";

// Placeholders para manter API de composição do shadcn
export function SelectTrigger(_p: any) { return null as any; }
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue(_p: any) { return null as any; }
SelectValue.displayName = "SelectValue";

export function SelectContent({ children, position, ...props }: { children: React.ReactNode; position?: string; [key: string]: any }) { 
  return <>{children}</>; 
}
SelectContent.displayName = "SelectContent";

export function SelectItem(_p: { value: string; children: React.ReactNode; className?: string; [key: string]: any }) { 
  return null as any; 
}
SelectItem.displayName = "SelectItem";

// Additional exports to match shadcn API
export function SelectGroup({ children }: { children: React.ReactNode }) { return <>{children}</>; }
SelectGroup.displayName = "SelectGroup";

export function SelectLabel({ children }: { children: React.ReactNode }) { return <>{children}</>; }
SelectLabel.displayName = "SelectLabel";

export function SelectSeparator(_p: any) { return null as any; }
SelectSeparator.displayName = "SelectSeparator";

export function SelectScrollUpButton(_p: any) { return null as any; }
SelectScrollUpButton.displayName = "SelectScrollUpButton";

export function SelectScrollDownButton(_p: any) { return null as any; }
SelectScrollDownButton.displayName = "SelectScrollDownButton";