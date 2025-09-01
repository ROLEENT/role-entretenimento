import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { Form } from "@/components/ui/form";

interface EventMediaTabProps {
  form: UseFormReturn<any>;
}

export function EventMediaTab({ form }: EventMediaTabProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="cover_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || ""}
                  onChange={field.onChange}
                  bucket="events"
                  folder="covers"
                  accept="image/*"
                  maxSizeMB={5}
                  className="aspect-video"
                  placeholder="Clique ou arraste uma imagem de capa para o evento"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}