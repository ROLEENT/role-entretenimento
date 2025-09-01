import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventBasicTab } from "./tabs/EventBasicTab";
import { EventDetailsTab } from "./tabs/EventDetailsTab";
import { EventMediaTab } from "./tabs/EventMediaTab";
import { EventLocationTab } from "./tabs/EventLocationTab";
import { EventTicketsTab } from "./tabs/EventTicketsTab";
import { useUpsertEvent } from "@/hooks/useUpsertEvent";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  status: z.enum(["draft", "published"]).default("draft"),
  city: z.string().min(1, "Cidade é obrigatória"),
  venue_id: z.string().uuid().optional().nullable(),
  organizer_id: z.string().uuid().optional().nullable(),
  starts_at: z.string().min(1, "Data de início é obrigatória"),
  ends_at: z.string().optional().nullable(),
  price_min: z.number().nonnegative().optional().nullable(),
  price_max: z.number().nonnegative().optional().nullable(),
  age_rating: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  ticket_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
  lineup_ids: z.array(z.string().uuid()).default([]),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AdminEventFormProps {
  event?: any;
}

export function AdminEventForm({ event }: AdminEventFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const { mutate: upsertEvent, isPending } = useUpsertEvent();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      slug: event?.slug || "",
      status: event?.status || "draft",
      city: event?.city || "",
      venue_id: event?.venue_id || null,
      organizer_id: event?.organizer_id || null,
      starts_at: event?.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : "",
      ends_at: event?.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "",
      price_min: event?.price_min || null,
      price_max: event?.price_max || null,
      age_rating: event?.age_rating || null,
      summary: event?.summary || null,
      cover_url: event?.cover_url || null,
      ticket_url: event?.ticket_url || null,
      tags: event?.tags || [],
      lineup_ids: event?.lineup_ids || [],
    },
  });

  const onSubmit = (data: EventFormData) => {
    const formData = {
      ...data,
      id: event?.id,
    };

    upsertEvent(formData, {
      onSuccess: () => {
        toast.success(event ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
        navigate("/admin-v3/eventos");
      },
      onError: (error) => {
        toast.error("Erro ao salvar evento: " + error.message);
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="location">Local</TabsTrigger>
          <TabsTrigger value="tickets">Ingressos</TabsTrigger>
          <TabsTrigger value="media">Mídia</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <EventBasicTab form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <EventDetailsTab form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Local e Organização</CardTitle>
            </CardHeader>
            <CardContent>
              <EventLocationTab form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Ingressos e Preços</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTicketsTab form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Imagens e Mídia</CardTitle>
            </CardHeader>
            <CardContent>
              <EventMediaTab form={form} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate("/admin-v3/eventos")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {event ? "Atualizar" : "Criar"} Evento
        </Button>
      </div>
    </form>
  );
}