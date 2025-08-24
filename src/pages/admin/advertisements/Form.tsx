// src/pages/admin/advertisements/Form.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { upsertAdvertisement, getAdvertisement } from "@/lib/repositories/advertisements";
import { listPartners } from "@/lib/repositories/partners";

export default function AdminAdsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    id: undefined, title: '', partner_id: '', placement: 'feed',
    status: 'draft', start_date: '', end_date: '', budget: '', asset_url: '', notes: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listPartners({ page: 1, pageSize: 100, active: true });
        setPartners(data || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getAdvertisement(id);
        setForm(data);
      } catch (e: any) { toast.error(e.message || 'Erro ao carregar patrocínio'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const save = async () => {
    if (!form.title) { toast.error('Título é obrigatório'); return; }
    if (!form.partner_id) { toast.error('Selecione um parceiro'); return; }
    if (form.end_date && form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
      toast.error('Data final não pode ser anterior à inicial');
      return;
    }
    try {
      setLoading(true);
      await upsertAdvertisement(form);
      toast.success('Salvo com sucesso');
      navigate('/admin/advertisements');
    } catch (e: any) { toast.error(e.message || 'Erro ao salvar'); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{id ? 'Editar Patrocínio' : 'Novo Patrocínio'}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Título*</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <Label>Parceiro*</Label>
            <Select value={form.partner_id} onValueChange={(v) => setForm({ ...form, partner_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Placement</Label>
            <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="stories">Stories</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
                <SelectItem value="highlight">Highlight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="running">Em execução</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Início</Label><Input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>Fim</Label><Input type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          <div><Label>Budget</Label><Input type="number" value={form.budget || ''} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Asset URL</Label><Input value={form.asset_url || ''} onChange={(e) => setForm({ ...form, asset_url: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Notas</Label><Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/advertisements')}>Cancelar</Button>
          <Button onClick={save} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}