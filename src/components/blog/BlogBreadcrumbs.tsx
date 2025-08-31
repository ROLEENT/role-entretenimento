import { BlogBreadcrumb, BreadcrumbItem } from "@/components/ui/unified-breadcrumb";

interface BlogBreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
}

const BlogBreadcrumbs = ({ items }: BlogBreadcrumbsProps) => {
  // Convert href to path and map the items
  const breadcrumbItems: BreadcrumbItem[] = items.map(item => ({
    label: item.label,
    path: item.href,
    isCurrentPage: item.isCurrentPage
  }));

  return <BlogBreadcrumb items={breadcrumbItems} />;
};

export default BlogBreadcrumbs;