import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { getPartner, upsertPartner, type PartnerFormData } from "@/lib/repositories/partners";
import { uploadPartnerLogo, deletePartnerLogo } from "@/lib/upload";
import { useSimulationMode } from "@/hooks/useSimulationMode";

const partnerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram: z.string().optional(),
  capacity: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  featured: z.boolean().default(false),
  types: z.string().optional(),
});

type PartnerForm = z.infer<typeof partnerSchema>;

export default function PartnerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      location: "",
      contact_email: "",
      website: "",
      instagram: "",
      capacity: "",
      rating: 0,
      featured: false,
      types: "",
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadPartner(id);
    }
  }, [id, isEditing]);

  const loadPartner = async (partnerId: string) => {
    try {
      setLoading(true);
      const partner = await getPartner(partnerId);
      
      form.reset({
        name: partner.name,
        location: partner.location,
        contact_email: partner.contact_email || "",
        website: partner.website || "",
        instagram: partner.instagram || "",
        capacity: partner.capacity || "",
        rating: partner.rating || 0,
        featured: partner.featured,
        types: partner.types?.join(", ") || "",
      });

      if (partner.image_url) {
        setImageUrl(partner.image_url);
      }
    } catch (error: any) {
      console.error('Erro ao carregar parceiro:', error);
      toast.error('Erro ao carregar parceiro');
      navigate('/admin/partners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadPartnerLogo(file, id);
      setImageUrl(url);
      setImageFile(file);
      toast.success('Logo enviado com sucesso');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro no upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = async () => {
    if (imageUrl) {
      try {
        await deletePartnerLogo(imageUrl);
        setImageUrl("");
        setImageFile(null);
        toast.success('Logo removido');
      } catch (error) {
        console.error('Erro ao remover logo:', error);
        toast.error('Erro ao remover logo');
      }
    }
  };

  const onSubmit = async (data: PartnerForm) => {
    try {
      setLoading(true);

      const partnerData: Partial<PartnerFormData> & { id?: string } = {
        ...data,
        types: data.types ? data.types.split(",").map(t => t.trim()).filter(Boolean) : [],
        contact_email: data.contact_email || undefined,
        website: data.website || undefined,
        image_url: imageUrl || undefined,
      };

      if (isEditing && id) {
        partnerData.id = id;
      }

      if (isReadOnlyError({ message: 'test' })) {
        simulateOperation(
          isEditing ? 'Atualização' : 'Criação', 
          data.name, 
          () => navigate('/admin/partners')
        );
        return;
      }

      await upsertPartner(partnerData);
      
      toast.success(isEditing ? 'Parceiro atualizado com sucesso' : 'Parceiro criado com sucesso');
      navigate('/admin/partners');
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation(
          isEditing ? 'Atualização' : 'Criação', 
          data.name, 
          () => navigate('/admin/partners')
        );
      } else {
        console.error('Erro ao salvar parceiro:', error);
        toast.error('Erro ao salvar parceiro');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/partners')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Parceiro</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do parceiro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização *</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade, Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contato</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@parceiro.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.parceiro.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="@usuario" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 500 pessoas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliação (0-5)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="5" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Parceiro Destacado</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="types"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipos (separados por vírgula)</FormLabel>
                        <FormControl>
                          <Input placeholder="Bar, Restaurante, Casa de Shows" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={loading || uploading || isSimulating}
                    >
                      {loading || isSimulating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditing ? 'Atualizando...' : 'Salvando...'}
                        </>
                      ) : (
                        isEditing ? 'Atualizar Parceiro' : 'Criar Parceiro'
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/admin/partners')}
                      disabled={loading || isSimulating}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Logo do Parceiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Logo do parceiro"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleImageRemove}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Clique para enviar o logo do parceiro
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, JPG, PNG ou WebP (máx. 5MB)
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="hidden"
                id="logo-upload"
                disabled={uploading}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {imageUrl ? 'Trocar Logo' : 'Enviar Logo'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}