import * as React from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type PublicProfileProps = {
  username: string;
};

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city_preferences: string[] | null;
  genre_preferences: string[] | null;
  is_profile_public: boolean;
};

type PublicAttendance = {
  event_id: string;
  status: "going" | "maybe" | "went";
  updated_at: string;
  title: string | null;
  starts_at: string | null;
  city: string | null;
  cover_url: string | null;
};

export function PublicProfile({ username }: PublicProfileProps) {
  const [meId, setMeId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [attLoading, setAttLoading] = React.useState(false);
  const [attendance, setAttendance] = React.useState<PublicAttendance[]>([]);

  const isOwner = React.useMemo(() => meId && profile?.id && meId === profile.id, [meId, profile?.id]);

  React.useEffect(() => {
    let active = true;
    async function bootstrap() {
      const { data: auth } = await supabase.auth.getUser();
      if (active) setMeId(auth?.user?.id ?? null);

      // Carrega o profile pelo username
      const { data, error } = await supabase
        .from("users_public")
        .select("id, username, display_name, avatar_url, bio, city_preferences, genre_preferences, is_profile_public")
        .eq("username", username)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.error(error);
      }
      setProfile((data as any) || null);
      setLoading(false);

      if (data?.is_profile_public) {
        setAttLoading(true);
        const { data: pub, error: e2 } = await supabase.rpc("get_user_public_attendance_by_username", {
          p_username: username,
          p_limit: 50,
        });
        if (!active) return;
        if (e2) console.error(e2);
        setAttendance((pub as any) || []);
        setAttLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Carregando perfil</div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg">Perfil não encontrado</p>
      </div>
    );
  }

  if (!profile.is_profile_public && !isOwner) {
    return (
      <div className="max-w-xl py-12">
        <h1 className="text-2xl font-semibold">{profile.display_name || profile.username}</h1>
        <p className="mt-2 text-sm opacity-70">Este perfil é privado</p>
      </div>
    );
  }

  const name = profile.display_name || profile.username;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url || undefined} alt={name} />
          <AvatarFallback>{(name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-sm opacity-70">@{profile.username}</p>
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="presencas">Presenças</TabsTrigger>
          {isOwner && <TabsTrigger value="salvos">Salvos</TabsTrigger>}
          {isOwner && <TabsTrigger value="seguindo">Seguindo</TabsTrigger>}
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
              <CardDescription>Informações públicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.bio && <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>}
              <div className="flex flex-wrap gap-2 text-sm">
                {profile.city_preferences?.map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {profile.genre_preferences?.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presencas" className="mt-4">
          {attLoading ? (
            <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Carregando</div>
          ) : attendance.length === 0 ? (
            <p className="text-sm opacity-70">Nenhuma presença pública por enquanto</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {attendance.map((row) => (
                <Card key={row.event_id}>
                  <CardHeader>
                    <CardTitle className="text-base">{row.title || "Evento"}</CardTitle>
                    <CardDescription>
                      {row.city ? `${row.city} • ` : ""}{row.starts_at ? new Date(row.starts_at).toLocaleString() : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge>{row.status === "going" ? "Vai" : row.status === "maybe" ? "Talvez" : "Foi"}</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link to={"/eventos/" + row.event_id}>Abrir evento</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="salvos" className="mt-4">
          {!isOwner ? (
            <p className="text-sm opacity-70">Salvos são privados</p>
          ) : (
            <OwnerSavedList userId={profile.id} />
          )}
        </TabsContent>

        <TabsContent value="seguindo" className="mt-4">
          {!isOwner ? (
            <p className="text-sm opacity-70">Lista de seguindo é privada</p>
          ) : (
            <OwnerFollowingList />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OwnerSavedList({ userId }: { userId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      // RLS: só o dono enxerga os próprios saves
      const { data, error } = await supabase
        .from("event_saves")
        .select(`
          event_id, 
          events!inner(title, date_start, city, cover_url)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!active) return;
      if (error) console.error(error);
      setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [userId]);

  if (loading) return <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Carregando</div>;
  if (items.length === 0) return <p className="text-sm opacity-70">Nenhum evento salvo</p>;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((row, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-base">{row.events?.title || "Evento"}</CardTitle>
            <CardDescription>
              {row.events?.city ? `${row.events.city} • ` : ""}
              {row.events?.date_start ? new Date(row.events.date_start).toLocaleString() : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link to={"/eventos/" + row.event_id}>Abrir evento</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OwnerFollowingList() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("follows")
        .select("entity_type, entity_uuid, entity_slug, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!active) return;
      if (error) console.error(error);
      setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Carregando</div>;
  if (items.length === 0) return <p className="text-sm opacity-70">Você ainda não segue ninguém</p>;

  return (
    <div className="space-y-2 text-sm">
      {items.map((f, i) => (
        <div key={i} className="flex items-center justify-between rounded-md border p-2">
          <div>
            <span className="font-medium">{f.entity_type}</span>{" "}
            <span className="opacity-70">{f.entity_uuid || f.entity_slug}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="#">Abrir</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}