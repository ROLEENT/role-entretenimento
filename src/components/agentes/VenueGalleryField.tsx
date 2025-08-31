import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Images, Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

export function VenueGalleryField() {
  const { watch, setValue } = useFormContext();
  const { uploadFile, uploading } = useStorageUpload();
  const galleryUrls = watch("gallery_urls") || [];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file, "venues");
        if (url) {
          const newUrls = [...galleryUrls, url];
          setValue("gallery_urls", newUrls, { shouldDirty: true });
        }
      } catch (error) {
        toast.error("Erro ao fazer upload da imagem");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = galleryUrls.filter((_: string, i: number) => i !== index);
    setValue("gallery_urls", newUrls, { shouldDirty: true });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newUrls = Array.from(galleryUrls);
    const [reorderedItem] = newUrls.splice(result.source.index, 1);
    newUrls.splice(result.destination.index, 0, reorderedItem);

    setValue("gallery_urls", newUrls, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          Galeria de Fotos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="gallery-upload"
            disabled={uploading}
          />
          <label htmlFor="gallery-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? "Fazendo upload..." : "Adicionar Fotos"}
              </span>
            </Button>
          </label>
        </div>

        {galleryUrls.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {galleryUrls.map((url: string, index: number) => (
                    <Draggable key={url} draggableId={url} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            snapshot.isDragging
                              ? "border-primary"
                              : "border-border"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="p-1 bg-white/20 rounded cursor-grab hover:bg-white/30"
                            >
                              <GripVertical className="h-4 w-4 text-white" />
                            </div>
                            
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 h-auto"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {galleryUrls.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma foto adicionada ainda</p>
            <p className="text-sm">Clique em "Adicionar Fotos" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}