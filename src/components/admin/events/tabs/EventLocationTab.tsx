import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { MultipleOrganizerSelector } from "@/components/agenda/MultipleOrganizerSelector";
import { Separator } from "@/components/ui/separator";

interface EventLocationTabProps {
  form: UseFormReturn<any>;
}

export function EventLocationTab({ form }: EventLocationTabProps) {
  // Fetch venues
  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("id, name, location")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch organizers
  const { data: organizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="venue_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local (Venue)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um local" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhum local selecionado</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      <div>
                        <div className="font-medium">{venue.name}</div>
                        {venue.location && (
                          <div className="text-sm text-muted-foreground">
                            {venue.location}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizador (Legado)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um organizador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhum organizador selecionado</SelectItem>
                  {organizers.map((organizer) => (
                    <SelectItem key={organizer.id} value={organizer.id}>
                      {organizer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Use o sistema de múltiplos organizadores abaixo (recomendado)
              </p>
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-2">
          <FormLabel>Organizadores do Evento</FormLabel>
          <MultipleOrganizerSelector 
            agendaId={form.watch("id")} 
            disabled={false}
          />
        </div>
      </div>
    </Form>
  );
}