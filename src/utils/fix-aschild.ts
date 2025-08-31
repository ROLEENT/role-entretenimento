// Script para automatizar correção de asChild em todo o projeto
// Este script ajuda a identificar e corrigir padrões comuns de React.Children.only

export const triggerComponents = [
  'DialogTrigger',
  'DropdownMenuTrigger', 
  'PopoverTrigger',
  'TooltipTrigger',
  'HoverCardTrigger',
  'CollapsibleTrigger',
  'AccordionTrigger',
  'AlertDialogTrigger'
];

export const asChildComponents = [
  'Button',
  'SidebarMenuButton',
  ...triggerComponents
];

// Padrões que precisam ser corrigidos
export const problematicPatterns = [
  // Button asChild com múltiplos filhos
  {
    pattern: /<Button[^>]*asChild[^>]*>\s*<Link[^>]*>\s*<[^>]+>\s*[^<]*\s*<\/[^>]+>\s*[^<]*\s*<\/Link>\s*<\/Button>/g,
    description: 'Button asChild com ícone + texto separados'
  },
  
  // DropdownMenuItem asChild com múltiplos filhos
  {
    pattern: /<DropdownMenuItem[^>]*asChild[^>]*>\s*<Link[^>]*>\s*<[^>]+>\s*[^<]*\s*<\/[^>]+>\s*[^<]*\s*<\/Link>\s*<\/DropdownMenuItem>/g,
    description: 'DropdownMenuItem asChild com ícone + texto separados'
  },
  
  // Triggers com múltiplos filhos
  {
    pattern: /<(Dialog|Dropdown|Popover|Tooltip|HoverCard|Collapsible|Accordion|AlertDialog)Trigger[^>]*asChild[^>]*>\s*<[^>]*>\s*<[^>]+>\s*[^<]*\s*<\/[^>]+>\s*[^<]*\s*<\/[^>]*>\s*<\/\1Trigger>/g,
    description: 'Triggers com múltiplos filhos'
  }
];

export const solutionTemplate = `
// Para corrigir, envolver o conteúdo com oneChild:
import { oneChild } from "@/components/utils/one-child";

// Antes:
<Button asChild>
  <Link to="/path">
    <Icon className="mr-2 h-4 w-4" />
    Texto
  </Link>
</Button>

// Depois:
<Button asChild>
  {oneChild(
    <Link to="/path" className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4" />
      Texto
    </Link>
  )}
</Button>
`;

console.log('Script de correção asChild carregado');
console.log('Componentes que precisam ser verificados:', asChildComponents);
console.log('Padrões problemáticos:', problematicPatterns.length);