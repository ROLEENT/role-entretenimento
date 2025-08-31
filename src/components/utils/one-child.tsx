import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Utilitário para garantir que qualquer conjunto de children seja transformado
 * em um único elemento React, evitando erros de React.Children.only.
 * 
 * Se houver múltiplos nós ou fragmentos, envolve em um span com flex layout.
 * Se já for um único elemento válido, retorna como está.
 */
export function oneChild(
  children: React.ReactNode,
  className?: string
): React.ReactElement {
  // Se children é null, undefined ou array vazio, retorna span vazio
  if (!children) {
    return <span className={cn("inline-flex items-center gap-2", className)} />;
  }

  // Converte children em array para análise
  const childrenArray = React.Children.toArray(children);
  
  // Remove elementos de texto vazios (apenas espaços em branco)
  const validChildren = childrenArray.filter(child => {
    if (typeof child === 'string') {
      return child.trim() !== '';
    }
    return true;
  });

  // Se há exatamente um filho válido e é um elemento React, retorna como está
  if (validChildren.length === 1 && React.isValidElement(validChildren[0])) {
    const child = validChildren[0];
    
    // Se o elemento já tem className, faz merge com a className fornecida
    if (className && child.props && typeof child.props === 'object' && 'className' in child.props) {
      return React.cloneElement(child, {
        className: cn(child.props.className as string, className)
      } as any);
    } else if (className) {
      return React.cloneElement(child, {
        className: cn(className)
      } as any);
    }
    
    return child;
  }

  // Se há múltiplos filhos ou nenhum filho válido, envolve em span
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {children}
    </span>
  );
}

/**
 * Hook para componentes que precisam garantir um único filho
 * Útil para componentes customizados que usam asChild
 */
export function useOneChild(children: React.ReactNode, className?: string) {
  return React.useMemo(() => oneChild(children, className), [children, className]);
}

/**
 * Componente wrapper para casos onde você precisa garantir um único filho
 * sem usar o utilitário diretamente
 */
export interface OneChildProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function OneChild({ children, className, as: Component = 'span' }: OneChildProps) {
  const childrenArray = React.Children.toArray(children);
  const validChildren = childrenArray.filter(child => {
    if (typeof child === 'string') {
      return child.trim() !== '';
    }
    return true;
  });

  if (validChildren.length === 1 && React.isValidElement(validChildren[0])) {
    return validChildren[0];
  }

  return (
    <Component className={cn("inline-flex items-center gap-2", className)}>
      {children}
    </Component>
  );
}