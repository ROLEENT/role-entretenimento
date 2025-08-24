// src/pages/admin/partners/Form.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getPartner, upsertPartner } from "@/lib/repositories/partners";
import { uploadPartnerLogo } from "@/lib/upload";

export default function AdminPartnersForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    id: undefined, name: '', city: '', instagram: '', contact_email: '',
    phone: '', website: '', notes: '', is_active: true, logo_url: ''
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getPartner(id);
        setForm(data);
      } catch (e: any) {
        toast.error(e.message || "Erro ao carregar parceiro");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    try {
      const url = await uploadPartnerLogo(file, form.id || 'new');
      setForm((f: any) => ({ ...f, logo_url: url }));
      toast.success('Logo enviada');
    } catch (e: any) { toast.error(e.message || 'Erro no upload'); }
  };

  const save = async () => {
    if (!form.name) { toast.error('Nome é obrigatório'); return; }
    try {
      setLoading(true);
      const payload = { ...form };
      const saved = await upsertPartner(payload);
      if (!form.id) setForm((f: any) => ({ ...f, id: saved.id }));
      toast.success('Salvo com sucesso');
      navigate('/admin/partners');
    } catch (e: any) { toast.error(e.message || 'Erro ao salvar'); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{id ? 'Editar Parceiro' : 'Novo Parceiro'}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Nome*</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Cidade</Label><Input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><Label>Instagram</Label><Input value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@perfil" /></div>
          <div><Label>Email</Label><Input type="email" value={form.contact_email || ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Website</Label><Input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Notas</Label><Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Checkbox checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: !!v })} /><Label>Ativo</Label></div>
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            <Input type="file" ref={fileRef} />
            <Button variant="outline" onClick={handleUpload}>Enviar</Button>
            {form.logo_url && <img src={form.logo_url} className="h-10 w-10 rounded object-cover" />}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/partners')}>Cancelar</Button>
          <Button onClick={save} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}