// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<{ partners: number; ads: number; highlights: number }>({ partners: 0, ads: 0, highlights: 0 });

  async function load() {
    setLoading(true);
    try {
      const { data: hl } = await supabase
        .from('highlights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const [{ count: partnersCount }, { count: adsCount }, { count: highlightsCount }] = await Promise.all([
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('advertisements').select('id', { count: 'exact', head: true }),
        supabase.from('highlights').select('id', { count: 'exact', head: true }),
      ]);

      setHighlights(hl || []);
      setMetrics({
        partners: partnersCount || 0,
        ads: adsCount || 0,
        highlights: highlightsCount || 0,
      });
    } catch (e: any) {
      toast.error(e.message || 'Erro ao carregar Dashboard');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Bem-vindo ao Admin</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded border"><div className="text-sm text-muted-foreground">Parceiros</div><div className="text-2xl font-bold">{metrics.partners}</div></div>
            <div className="p-3 rounded border"><div className="text-sm text-muted-foreground">Patrocínios</div><div className="text-2xl font-bold">{metrics.ads}</div></div>
            <div className="p-3 rounded border"><div className="text-sm text-muted-foreground">Destaques</div><div className="text-2xl font-bold">{metrics.highlights}</div></div>
          </div>
          <Button onClick={() => navigate('/admin/highlights')}>Ver todos os Destaques</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Últimos Destaques</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/highlights')}>Ver todos</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highlights.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.title || '(sem título)'}</TableCell>
                  <TableCell>{h.city || '-'}</TableCell>
                  <TableCell>{h.created_at?.slice(0,10) || '-'}</TableCell>
                </TableRow>
              ))}
              {highlights.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum destaque encontrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}