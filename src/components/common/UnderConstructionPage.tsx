"use client";

import { Construction, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnderConstructionPageProps {
  title: string;
  description: string;
  expectedDate?: string;
  backTo?: string;
  backLabel?: string;
}

export function UnderConstructionPage({
  title,
  description,
  expectedDate,
  backTo = "/admin-v3/agenda",
  backLabel = "Voltar para Agenda"
}: UnderConstructionPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Construction className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {description}
            </p>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>

          {expectedDate && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Previsão: {expectedDate}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Em desenvolvimento ativo</span>
          </div>

          <div className="pt-2">
            <Button asChild variant="outline">
              <Link to={backTo} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}