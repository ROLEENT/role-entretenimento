// src/pages/admin/partners/List.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listPartners, deletePartner, togglePartnerActive } from "@/lib/repositories/partners";

export default function AdminPartnersList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [count, setCount] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const { data, count } = await listPartners({ q, page: 1, pageSize: 20 });
      setRows(data || []);
      setCount(count || 0);
    } catch (e: any) {
      toast.error(e.message || "Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Parceiros ({count})</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={load} disabled={loading}>Buscar</Button>
          <Button onClick={() => navigate("/admin/partners/new")}>Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.logo_url ? <img src={r.logo_url} alt={r.name} className="h-8 w-8 rounded object-cover" /> : "-"}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.city || "-"}</TableCell>
                <TableCell>{r.instagram ? <a className="underline" href={`https://instagram.com/${r.instagram.replace('@','')}`} target="_blank">{r.instagram}</a> : "-"}</TableCell>
                <TableCell>{r.contact_email || "-"}</TableCell>
                <TableCell>{r.is_active ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/partners/${r.id}`)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      await togglePartnerActive(r.id, !r.is_active);
                      toast.success('Status atualizado');
                      load();
                    } catch (e: any) { toast.error(e.message); }
                  }}>{r.is_active ? 'Desativar' : 'Ativar'}</Button>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (!confirm('Excluir parceiro?')) return;
                    try { await deletePartner(r.id); toast.success('Excluído'); load(); } catch (e: any) { toast.error(e.message); }
                  }}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum parceiro encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}