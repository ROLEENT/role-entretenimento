import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrentPage?: boolean;
}

interface UnifiedBreadcrumbProps {
  items: BreadcrumbItem[];
  homeLabel?: string;
  homePath?: string;
  showHome?: boolean;
  className?: string;
}

export function UnifiedBreadcrumb({ 
  items, 
  homeLabel,
  homePath = "/",
  showHome = true,
  className = "mb-6"
}: UnifiedBreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: homeLabel || "Home", path: homePath }, ...items]
    : items;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {allItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.isCurrentPage || (!item.path && index === allItems.length - 1) ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : item.path ? (
              <BreadcrumbLink asChild>
                <Link to={item.path} className="flex items-center gap-1">
                  {index === 0 && showHome && homeLabel && (
                    <Home className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </Link>
              </BreadcrumbLink>
            ) : (
              <span>{item.label}</span>
            )}
            {index < allItems.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Convenience component for admin breadcrumbs
export function AdminBreadcrumb({ items, className }: { items: BreadcrumbItem[], className?: string }) {
  return (
    <UnifiedBreadcrumb
      items={items}
      homeLabel="Admin v3"
      homePath="/admin-v3"
      className={className}
    />
  );
}

// Convenience component for blog breadcrumbs  
export function BlogBreadcrumb({ items, className }: { items: BreadcrumbItem[], className?: string }) {
  return (
    <UnifiedBreadcrumb
      items={items}
      homeLabel="Blog"
      homePath="/blog"
      className={className}
    />
  );
}