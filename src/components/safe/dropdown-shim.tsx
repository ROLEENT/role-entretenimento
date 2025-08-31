"use client";
import React, { createContext, useContext, useState } from "react";

const Ctx = createContext<{open:boolean; setOpen:(v:boolean)=>void} | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-block group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
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

export function DropdownMenuContent({ children, align = "start", sideOffset = 8, className, ...rest }: any) {
  const ctx = useContext(Ctx)!;
  const alignClass = align === "end" ? "right-0" : "left-0";
  return (
    <div
      role="menu"
      className={`${alignClass} absolute mt-2 min-w-48 rounded-xl border bg-popover p-1 shadow-lg z-50
        transition-opacity ${ctx.open ? "visible opacity-100" : "invisible opacity-0"} ${className ?? ""}`}
      style={{ marginTop: sideOffset }}
      {...rest}
    >
      <ul className="grid gap-1">{children}</ul>
    </div>
  );
}

export function DropdownMenuItem({ children, onSelect, onClick, className, ...rest }: any) {
  const handle = onSelect ?? onClick;
  return (
    <li>
      <button
        type="button"
        onClick={handle}
        className={`block w-full text-left rounded-md px-3 py-2 hover:bg-accent ${className ?? ""}`}
        {...rest}
      >
        {children}
      </button>
    </li>
  );
}