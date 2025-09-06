import { Navigate, useParams } from "react-router-dom";

interface DynamicRedirectProps {
  basePath: string;
  fallbackPath?: string;
}

export function DynamicRedirect({ basePath, fallbackPath = "/" }: DynamicRedirectProps) {
  const { id } = useParams();
  
  if (!id) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <Navigate to={`${basePath}/${id}/edit`} replace />;
}