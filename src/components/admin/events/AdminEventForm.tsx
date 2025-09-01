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
import { eventFlexibleSchema, EventFlexibleForm } from "@/schemas/event-flexible";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface AdminEventFormProps {
  event?: any;
}

export function AdminEventForm({ event }: AdminEventFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const { mutate: upsertEvent, isPending } = useUpsertEvent();

  const form = useForm<EventFlexibleForm>({
    resolver: zodResolver(eventFlexibleSchema),
    defaultValues: {
      title: event?.title || "",
      slug: event?.slug || "",
      status: event?.status || "draft",
      city_id: event?.city_id || "",
      venue_id: event?.venue_id || null,
      organizer_id: event?.organizer_id || null,
      starts_at: event?.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : "",
      ends_at: event?.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "",
      price_min: event?.price_min || null,
      price_max: event?.price_max || null,
      age_rating: event?.age_rating || null,
      excerpt: event?.excerpt || null,
      content: event?.content || null,
      cover_url: event?.cover_url || null,
      lineup: event?.lineup || [],
    },
  });

  const onSubmit = (data: EventFlexibleForm) => {
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