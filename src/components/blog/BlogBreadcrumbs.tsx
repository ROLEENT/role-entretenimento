import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BlogBreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
}

const BlogBreadcrumbs = ({ items }: BlogBreadcrumbsProps) => {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.isCurrentPage ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : item.href ? (
              <BreadcrumbLink asChild>
                <Link to={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            ) : (
              <span>{item.label}</span>
            )}
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BlogBreadcrumbs;