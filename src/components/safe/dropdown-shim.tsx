import React, { createContext, useContext, useState, useRef } from "react";

const Ctx = createContext<{open:boolean; setOpen:(v:boolean)=>void} | null>(null);

export function DropdownMenu({ children, modal }: { children: React.ReactNode; modal?: boolean }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle mouse enter/leave with debouncing
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };
  
  const handleMouseLeave = () => {
    // Delay closing to allow cursor to move to dropdown content
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function DropdownMenuTrigger({ children, className, ...rest }: any) {
  const ctx = useContext(Ctx)!;
  return (
    <button
      type="button"
      className={`px-3 py-2 rounded-md hover:bg-accent/50 outline-none ${className ?? ""}`}
      onClick={() => ctx.setOpen(!ctx.open)} // fallback mobile
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = "start", sideOffset = 4, className, position, ...rest }: any) {
  const ctx = useContext(Ctx)!;
  const alignClass = align === "end" ? "right-0" : "left-0";
  
  return (
    <div
      role="menu"
      className={`${alignClass} absolute min-w-48 rounded-xl border bg-popover p-1 shadow-lg z-[9999]
        transition-all duration-200 ease-in-out ${ctx.open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2"} ${className ?? ""}`}
      style={{ 
        marginTop: sideOffset,
        background: "hsl(var(--popover))",
        border: "1px solid hsl(var(--border))"
      }}
      {...rest}
    >
      <ul className="grid gap-1">{children}</ul>
    </div>
  );
}

export function DropdownMenuItem({ children, onSelect, onClick, className, inset, ...rest }: any) {
  const handle = onSelect ?? onClick;
  return (
    <li>
      <button
        type="button"
        onClick={handle}
        className={`block w-full text-left rounded-md px-3 py-2 hover:bg-accent ${inset ? 'pl-8' : ''} ${className ?? ""}`}
        {...rest}
      >
        {children}
      </button>
    </li>
  );
}

// Additional exports to match shadcn API
export function DropdownMenuLabel({ children, className, inset, ...rest }: any) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${inset ? 'pl-8' : ''} ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...rest }: any) {
  return <hr className={`-mx-1 my-1 h-px bg-muted ${className ?? ""}`} {...rest} />;
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function DropdownMenuSub({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function DropdownMenuSubContent({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function DropdownMenuSubTrigger({ children, className, inset, ...rest }: any) {
  return (
    <button className={`flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent ${inset ? 'pl-8' : ''} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}

export function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) { 
  return <>{children}</>; 
}

export function DropdownMenuCheckboxItem({ children, checked, className, ...rest }: any) {
  return (
    <li>
      <button
        type="button"
        className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent ${className ?? ""}`}
        {...rest}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <span>✓</span>}
        </span>
        {children}
      </button>
    </li>
  );
}

export function DropdownMenuRadioItem({ children, className, ...rest }: any) {
  return (
    <li>
      <button
        type="button"
        className={`relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent ${className ?? ""}`}
        {...rest}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-current"></span>
        </span>
        {children}
      </button>
    </li>
  );
}

export function DropdownMenuShortcut({ children, className, ...rest }: any) {
  return (
    <span className={`ml-auto text-xs tracking-widest opacity-60 ${className ?? ""}`} {...rest}>
      {children}
    </span>
  );
}