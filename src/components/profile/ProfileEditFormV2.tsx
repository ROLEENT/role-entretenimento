import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";

const usernameRegex = /^[a-z0-9_.]{3,20}$/;

const ProfileSchema = z.object({
  username: z
    .string()
    .min(3, "mínimo 3 caracteres")
    .max(20, "máximo 20 caracteres")
    .regex(usernameRegex, "use apenas letras minúsculas, números, _ ou ."),
  display_name: z.string().min(2, "mínimo 2 caracteres").max(60, "máximo 60"),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
  bio: z.string().max(240, "máximo 240 caracteres").optional().or(z.literal("")),
  city_preferences: z.string().optional().or(z.literal("")),
  genre_preferences: z.string().optional().or(z.literal("")),
  accessibility_notes: z.string().optional().or(z.literal("")),
  is_profile_public: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export type ProfileEditFormProps = {
  className?: string;
  onAuthRequired?: () => void;
};

function csvToArray(v?: string | null) {
  if (!v) return [] as string[];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToCSV(a?: string[] | null) {
  if (!a || a.length === 0) return "";
  return a.join(", ");
}

export function ProfileEditFormV2({ className, onAuthRequired }: ProfileEditFormProps) {
  const { user } = useUserAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: "",
      display_name: "",
      avatar_url: "",
      bio: "",
      city_preferences: "",
      genre_preferences: "",
      accessibility_notes: "",
      is_profile_public: true,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!user) {
        onAuthRequired?.();
        setLoading(false);
        return;
      }

      // Tenta carregar o profile existente
      const { data, error } = await supabase
        .from("users_public")
        .select("username, display_name, avatar_url, bio, city_preferences, genre_preferences, accessibility_notes, is_profile_public")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error && error.code !== "PGRST116") {
        console.error(error);
      }

      if (!data) {
        // se não existe, tenta criar via ensure_user_profile com uma sugestão de username
        const base = (user.user_metadata?.name || user.email || "usuario").toLowerCase();
        const sugestao = base
          .replace(/[^a-z0-9_.]+/g, "")
          .replace(/\.+/g, ".")
          .slice(0, 16) || `user${Date.now()}`;
        await supabase.rpc("ensure_user_profile", {
          p_username: sugestao,
          p_display_name: user.user_metadata?.name || "",
          p_avatar_url: user.user_metadata?.avatar_url || "",
        });
        const { data: created } = await supabase
          .from("users_public")
          .select("username, display_name, avatar_url, bio, city_preferences, genre_preferences, accessibility_notes, is_profile_public")
          .eq("id", user.id)
          .maybeSingle();
        if (created) {
          form.reset({
            username: created.username || "",
            display_name: created.display_name || "",
            avatar_url: created.avatar_url || "",
            bio: created.bio || "",
            city_preferences: arrayToCSV(created.city_preferences),
            genre_preferences: arrayToCSV(created.genre_preferences),
            accessibility_notes: created.accessibility_notes || "",
            is_profile_public: !!created.is_profile_public,
          });
        }
      } else {
        form.reset({
          username: data.username || "",
          display_name: data.display_name || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          city_preferences: arrayToCSV(data.city_preferences),
          genre_preferences: arrayToCSV(data.genre_preferences),
          accessibility_notes: data.accessibility_notes || "",
          is_profile_public: !!data.is_profile_public,
        });
      }

      setLoading(false);
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, [user, form, onAuthRequired]);

  async function checkUsernameAvailability(u: string) {
    if (!u || !usernameRegex.test(u)) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    const { data, error } = await supabase
      .from("users_public")
      .select("id")
      .eq("username", u)
      .limit(1);
    if (error) {
      console.error(error);
      setUsernameAvailable(null);
    } else {
      const exists = !!(data && data.length > 0 && data[0].id !== user?.id);
      setUsernameAvailable(!exists);
    }
    setUsernameChecking(false);
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      setSaving(true);
      if (!user) {
        onAuthRequired?.();
        return;
      }

      // Pre-checagem username
      if (values.username) {
        await checkUsernameAvailability(values.username);
        if (usernameAvailable === false) {
          toast({ title: "Username já em uso", description: "Escolha outro.", variant: "destructive" });
          return;
        }
      }

      const payload = {
        id: user.id,
        username: values.username,
        display_name: values.display_name,
        avatar_url: values.avatar_url || null,
        bio: values.bio || null,
        city_preferences: csvToArray(values.city_preferences),
        genre_preferences: csvToArray(values.genre_preferences),
        accessibility_notes: values.accessibility_notes || null,
        is_profile_public: values.is_profile_public,
      };

      const { error } = await supabase.from("users_public").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      toast({ title: "Perfil salvo", description: "Suas alterações foram atualizadas." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const username = form.watch("username");
  React.useEffect(() => {
    const t = setTimeout(() => {
      void checkUsernameAvailability(username);
    }, 400);
    return () => clearTimeout(t);
  }, [username, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando perfil
      </div>
    );
  }

  const badge = usernameChecking
    ? "checando..."
    : usernameAvailable === null
    ? ""
    : usernameAvailable
    ? "disponível"
    : "indisponível";

  return (
    <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_name">Nome para exibição</Label>
            <Input id="display_name" placeholder="Seu nome" {...form.register("display_name")} />
            {form.formState.errors.display_name && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.display_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="seu.user" {...form.register("username")} />
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="opacity-70">{badge}</span>
              {form.formState.errors.username && (
                <span className="text-red-500">{form.formState.errors.username.message}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input id="avatar_url" placeholder="https://..." {...form.register("avatar_url")} />
            {form.formState.errors.avatar_url && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.avatar_url.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} placeholder="Quem é você no rolê" {...form.register("bio")} />
            {form.formState.errors.bio && (
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.bio.message}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city_preferences">Cidades favoritas</Label>
            <Input id="city_preferences" placeholder="porto alegre, são paulo, rio" {...form.register("city_preferences")} />
          </div>
          <div>
            <Label htmlFor="genre_preferences">Gêneros preferidos</Label>
            <Input id="genre_preferences" placeholder="techno, funk 150, disco" {...form.register("genre_preferences")} />
          </div>
        </div>

        <div>
          <Label htmlFor="accessibility_notes">Acessibilidade e necessidades</Label>
          <Textarea id="accessibility_notes" rows={3} placeholder="Ex: rampa, assento, sinalização" {...form.register("accessibility_notes")} />
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="is_profile_public" className="cursor-pointer">Perfil público</Label>
            <p className="text-xs opacity-70">Se desativar, seu perfil fica invisível e suas presenças não aparecem publicamente.</p>
          </div>
          <Switch id="is_profile_public" checked={form.watch("is_profile_public")}
            onCheckedChange={(v) => form.setValue("is_profile_public", v)} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando</> : "Salvar perfil"}
          </Button>
        </div>
      </div>
    </form>
  );
}