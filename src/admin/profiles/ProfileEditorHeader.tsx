import { useState, useEffect } from "react";
import { publicUrlFor, setProfileVisibility } from "./adminApi";
import { toast } from "sonner";

type Props = {
  id: string;
  handle?: string;
  visibility: "public"|"draft"|"private";
  onVisibilityChange(next: "public"|"draft"|"private"): void;
  // Required fields for publishing validation
  avatar_url?: string;
  cover_url?: string;
  city?: string;
  state?: string;
};

export default function ProfileEditorHeader({ id, handle, visibility, onVisibilityChange, avatar_url, cover_url, city, state }: Props) {
  const [busy, setBusy] = useState(false);
  const [publicUrl, setPublicUrl] = useState(publicUrlFor(handle, visibility));

  // Update public URL when handle changes
  useEffect(() => {
    setPublicUrl(publicUrlFor(handle, visibility));
  }, [handle, visibility]);

  async function change(v: "public"|"draft"|"private") {
    // Validate required fields for publishing
    if (v === "public") {
      const missing = [];
      if (!avatar_url) missing.push("avatar");
      if (!city) missing.push("cidade");
      if (!state) missing.push("estado");
      
      if (missing.length > 0) {
        toast.error(`Complete os campos obrigatórios para publicar: ${missing.join(", ")}.`);
        return;
      }
    }

    setBusy(true);
    try {
      await setProfileVisibility(id, v);
      onVisibilityChange(v);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full border
          ${visibility==='public' ? 'bg-green-50 border-green-200 text-green-700' :
            visibility==='draft' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
            'bg-gray-100 border-gray-200 text-gray-700'}`}>
          {visibility === "public" ? "Publicado" : visibility === "draft" ? "Rascunho" : "Privado"}
        </span>
        {handle ? <span className="text-xs text-gray-500">@{handle}</span> : null}
      </div>

      <div className="flex items-center gap-2">
        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener"
            className="h-9 px-3 rounded-md border text-sm"
            title={visibility === "public" ? "Ver no site" : "Ver prévia no site"}
          >
            Ver no site
          </a>
        ) : null}

        <div className="relative">
          <select
            value={visibility}
            disabled={busy}
            onChange={(e) => change(e.target.value as any)}
            className="h-9 px-3 rounded-md border text-sm bg-white"
            title="Visibilidade"
          >
            <option value="draft">Salvar rascunho</option>
            <option value="public">Publicar</option>
            <option value="private">Tornar privado</option>
          </select>
        </div>
      </div>
    </div>
  );
}