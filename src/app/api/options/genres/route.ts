import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const sb = supabaseServer;
  
  const { data, error } = await sb
    .from("genres")
    .select("id, name")
    .ilike("name", `%${q}%`)
    .eq("is_active", true)
    .order("name")
    .limit(50);
    
  if (error) {
    console.error("Genres fetch error:", error);
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
    .from("genres")
    .upsert({ name, slug, is_active: true }, { onConflict: "slug" })
    .select("id, name")
    .single();
    
  if (error) {
    console.error("Genre creation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(data);
}