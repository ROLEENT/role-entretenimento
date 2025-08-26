import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award } from "lucide-react";

export default function AdminGamification() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
        <p className="text-muted-foreground">
          Sistema de pontos, badges e conquistas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Badges Ativas
            </CardTitle>
            <CardDescription>15 badges disponíveis</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Pontos Distribuídos
            </CardTitle>
            <CardDescription>12,450 pontos este mês</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Conquistas
            </CardTitle>
            <CardDescription>230 conquistas desbloqueadas</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}