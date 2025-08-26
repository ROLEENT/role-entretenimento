import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, History } from "lucide-react";

export default function AdminBlog() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Gestão de posts e conteúdo do blog
          </p>
        </div>
        <Button onClick={() => navigate("/admin/blog/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/admin/blog/create")}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Criar Novo Post
            </CardTitle>
            <CardDescription>
              Escrever uma nova publicação para o blog
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/admin/blog/history")}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Histórico de Posts
            </CardTitle>
            <CardDescription>
              Ver todos os posts publicados e rascunhos
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}