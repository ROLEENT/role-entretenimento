// src/pages/admin/advertisements/List.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { listAdvertisements, deleteAdvertisement, updateAdStatus } from "@/lib/repositories/advertisements";

export default function AdminAdsList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data, count } = await listAdvertisements({ q, status, page: 1, pageSize: 20 });
      setRows(data || []);
      setCount(count || 0);
    } catch (e: any) {
      toast.error(e.message || "Erro ao carregar patrocínios");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patrocínios ({count})</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Buscar por título..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="running">Em execução</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={load} disabled={loading}>Filtrar</Button>
          <Button onClick={() => navigate('/admin/advertisements/new')}>Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>{r.partners?.name || '-'}</TableCell>
                <TableCell>{r.placement}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.start_date || '-'} {r.end_date ? `→ ${r.end_date}` : ''}</TableCell>
                <TableCell>{r.budget ?? '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/advertisements/${r.id}`)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    const next = r.status === 'paused' ? 'running' : 'paused';
                    try { await updateAdStatus(r.id, next); toast.success('Status atualizado'); load(); }
                    catch (e: any) { toast.error(e.message); }
                  }}>{r.status === 'paused' ? 'Retomar' : 'Pausar'}</Button>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (!confirm('Excluir patrocínio?')) return;
                    try { await deleteAdvertisement(r.id); toast.success('Excluído'); load(); } catch (e: any) { toast.error(e.message); }
                  }}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum patrocínio encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}