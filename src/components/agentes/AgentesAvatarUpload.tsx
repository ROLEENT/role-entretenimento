import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RHFInput } from "@/components/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AgentesAvatarUpload() {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const avatarUrl = watch("avatar_url");
  const avatarAlt = watch("avatar_alt");
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas.");
      return;
    }

    setIsUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('agents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('agents')
        .getPublicUrl(filePath);

      setValue("avatar_url", publicUrl, { shouldValidate: true });
      
      // Auto-gerar alt text baseado no nome se não tiver
      if (!avatarAlt) {
        const name = watch("name");
        if (name) {
          setValue("avatar_alt", `Foto de ${name}`, { shouldValidate: true });
        }
      }

      toast.success("Avatar enviado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = () => {
    setValue("avatar_url", "", { shouldValidate: true });
    setValue("avatar_alt", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>Avatar</Label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden bg-muted/50">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={avatarAlt || "Avatar preview"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Enviando..." : "Selecionar Arquivo"}
            </Button>
            
            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeAvatar}
                disabled={isUploading}
              >
                <X className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Formatos: JPG, PNG, WebP. Máximo 5MB.
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Alt text input - só mostra se tem imagem */}
      {avatarUrl && (
        <RHFInput
          name="avatar_alt"
          label="Texto Alternativo"
          placeholder="Descrição da imagem para acessibilidade"
          description="Importante para acessibilidade. Descreva brevemente a imagem."
        />
      )}

      {/* Error display */}
      {(errors.avatar_url || errors.avatar_alt) && (
        <div className="text-sm text-destructive">
          {errors.avatar_url?.message as string || errors.avatar_alt?.message as string}
        </div>
      )}
    </div>
  );
}