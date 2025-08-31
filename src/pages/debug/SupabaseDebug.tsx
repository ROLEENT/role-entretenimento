import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Lovable doesn't support VITE_* env vars, so we use the actual values
const url = "https://nutlcbnruabjsxecqpnd.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c";

const supabase = createClient(url || "", anon || "", { auth: { persistSession: false } });

export default function SupabaseDebug() {
  const [out, setOut] = useState<any>({});

  useEffect(() => {
    (async () => {
      const steps:any = { env: { hasUrl: !!url, hasAnonKey: !!anon, url } };

      try {
        // 1) ping simples: select * limit 1 SEM filtro
        const t1 = performance.now();
        const q1 = await supabase.from("posts_public").select("*").limit(1);
        steps.selectAny = { ms: Math.round(performance.now() - t1), error: q1.error?.message, rows: q1.data?.length ?? 0 };

        // 2) com filtro status=published (se a coluna existir)
        const t2 = performance.now();
        const q2 = await supabase.from("posts_public").select("id, slug, title").eq("status","published").limit(1);
        steps.selectStatus = { ms: Math.round(performance.now() - t2), error: q2.error?.message, rows: q2.data?.length ?? 0 };

        // 3) chamada REST direta (confirma CORS e headers)
        if (url && anon) {
          const t3 = performance.now();
          const res = await fetch(`${url}/rest/v1/posts_public?select=id,slug,title&limit=1`, {
            headers: { apikey: anon, Authorization: `Bearer ${anon}` },
          });
          steps.rest = { status: res.status, ms: Math.round(performance.now() - t3), text: await res.text() };
        }
      } catch (e:any) {
        steps.fatal = String(e?.message ?? e);
      }
      setOut(steps);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug</h1>
      <pre className="text-sm whitespace-pre-wrap bg-black/5 p-4 rounded">{JSON.stringify(out, null, 2)}</pre>
      <p className="mt-2 text-sm text-gray-600">Se selectStatus tiver erro "column ... does not exist", a view não tem essa coluna.</p>
    </main>
  );
}