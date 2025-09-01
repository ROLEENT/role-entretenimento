import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface LinkRepeaterProps {
  name: string;
  label: string;
  description?: string;
}

export function LinkRepeater({ name, label, description }: LinkRepeaterProps) {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const addLink = () => {
    append({ label: "", url: "" });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`${name}.${index}.label`} className="text-sm">
                      Título do Link
                    </Label>
                    <Input
                      id={`${name}.${index}.label`}
                      placeholder="Ex: Ingressos, Site oficial..."
                      {...register(`${name}.${index}.label`)}
                    />
                    {errors?.[name]?.[index]?.label && (
                      <p className="text-sm text-destructive mt-1">
                        {errors[name][index].label.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`${name}.${index}.url`} className="text-sm">
                      URL
                    </Label>
                    <Input
                      id={`${name}.${index}.url`}
                      type="url"
                      placeholder="https://..."
                      {...register(`${name}.${index}.url`)}
                    />
                    {errors?.[name]?.[index]?.url && (
                      <p className="text-sm text-destructive mt-1">
                        {errors[name][index].url.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addLink}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Link
      </Button>
    </div>
  );
}