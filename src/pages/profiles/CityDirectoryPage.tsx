import { useParams, Navigate } from "react-router-dom";

export default function CityDirectoryPage() {
  // Reutilize DirectoryPage passando city via querystring no link ou crie uma versão que injeta cidade
  // Simples: redirecione para /perfis?city=slug
  const { slug = "" } = useParams();
  
  return <Navigate to={`/perfis?city=${slug}`} replace />;
}