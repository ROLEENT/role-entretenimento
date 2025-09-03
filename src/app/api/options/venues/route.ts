import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const sb = supabaseServer;
  
  let query = sb
    .from("venues")
    .select("id, name, city, address, type")
    .eq("status", "active")
    .order("name")
    .limit(50);
    
  if (q.trim()) {
    // Busca por nome, cidade ou endereço
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`);
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error("Venues fetch error:", error);
    return Response.json({ items: [], error: error.message }, { status: 500 });
  }
  
  return Response.json({ items: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  
  if (!name) {
    return Response.json({ error: "name vazio" }, { status: 400 });
  }
  
  const sb = supabaseServer;
  
  // Generate slug from name
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  const { data, error } = await sb
    .from("venues")
    .upsert({ 
      name, 
      slug, 
      status: "active",
      city: body.city || "",
      address: body.address || "",
      type: body.type || "venue"
    }, { onConflict: "slug" })
    .select("id, name, city, address, type")
    .single();
    
  if (error) {
    console.error("Venue creation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(data);
}