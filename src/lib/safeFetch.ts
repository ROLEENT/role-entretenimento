export type Json<T=any> = { ok: boolean; status: number; data?: T; error?: string };

export async function safeFetch<T=any>(url: string, opts?: RequestInit & { timeout?: number }): Promise<Json<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), opts?.timeout ?? 8000);

  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, cache: "no-store" });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : undefined;
    return { ok: res.ok, status: res.status, data: body as T };
  } catch (e:any) {
    return { ok: false, status: 0, error: e?.name === "AbortError" ? "timeout" : String(e?.message ?? e) };
  } finally {
    clearTimeout(id);
  }
}

export async function safeFetchJSON(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  } catch (e:any) {
    return { ok: false, status: 0, json: { error: e?.name === "AbortError" ? "timeout" : "fetch_error" } };
  } finally {
    clearTimeout(t);
  }
}