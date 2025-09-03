import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
// Removido: usando sistema unificado de dropdowns
import { useTheme } from "@/components/ThemeProvider";
import { ClientOnly } from "@/components/ClientOnly";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <ClientOnly fallback={
      <Button variant="outline" size="icon" className="relative">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    }>
      <div className="dd" data-dd>
        <button 
          className="dd-trigger" 
          data-dd-trigger 
          aria-expanded="false"
          aria-label="Alternar tema"
        >
          <div className="relative h-9 w-9 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
        </button>
        
        <div className="dd-menu" data-dd-menu role="menu" data-dd-align="right">
          <button 
            role="menuitem" 
            onClick={() => setTheme("light")}
            className={theme === "light" ? "bg-accent" : ""}
          >
            <Sun className="h-4 w-4" />
            Claro
          </button>
          <button 
            role="menuitem" 
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "bg-accent" : ""}
          >
            <Moon className="h-4 w-4" />
            Escuro
          </button>
          <button 
            role="menuitem" 
            onClick={() => setTheme("system")}
            className={theme === "system" ? "bg-accent" : ""}
          >
            <Monitor className="h-4 w-4" />
            Sistema
          </button>
        </div>
      </div>
    </ClientOnly>
  );
}