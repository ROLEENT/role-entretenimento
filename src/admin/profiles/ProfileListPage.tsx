import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicUrlFor } from "./adminApi";

export default function ProfileListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<"all"|"public"|"draft"|"private">("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      let query = supabase
        .from("profiles")
        .select("id, name, handle, type, city, visibility, published_at")
        .order("published_at", { ascending: false, nullsFirst: true })
        .limit(200);

      if (q) query = query.ilike("name", `%${q}%`);
      if (visibility !== "all") query = query.eq("visibility", visibility);

      const { data } = await query;
      if (mounted) setItems(data ?? []);
    })();
    return () => { mounted = false; };
  }, [q, visibility]);

  return (
    <div className="p-6 grid gap-4">
      <div className="flex items-center gap-2">
        <input className="h-9 px-3 rounded-md border text-sm" placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="h-9 px-3 rounded-md border text-sm" value={visibility} onChange={(e)=>setVisibility(e.target.value as any)}>
          <option value="all">Todos</option>
          <option value="public">Publicados</option>
          <option value="draft">Rascunho</option>
          <option value="private">Privados</option>
        </select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Nome</th><th>Handle</th><th>Tipo</th><th>Cidade</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} className="border-t">
              <td>{p.name}</td>
              <td>@{p.handle}</td>
              <td>{p.type}</td>
              <td>{p.city}</td>
              <td>
                <span className={`px-2 py-0.5 rounded-full border ${
                  p.visibility==='public' ? 'bg-green-50 border-green-200 text-green-700' :
                  p.visibility==='draft' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  'bg-gray-100 border-gray-200 text-gray-700'
                }`}>
                  {p.visibility}
                </span>
              </td>
              <td className="text-right">
                <a href={`/admin/perfis/${p.id}/editar`} className="underline mr-3">Editar</a>
                <a href={publicUrlFor(p.handle, p.visibility) ?? "#"} className="underline" target="_blank" rel="noopener">Ver no site</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}