import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image, Video, Music, Loader2 } from 'lucide-react';
import { useUploadMedia } from '@/hooks/useUploadMedia';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';

interface MediaUploadProps {
  profileId: string;
  onUploadComplete?: () => void;
}

export function MediaUpload({ profileId, onUploadComplete }: MediaUploadProps) {
  const { uploadMedia, uploading, isAuthenticated } = useUploadMedia();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect media type based on file
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else if (file.type.startsWith('audio/')) {
        setMediaType('audio');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }

    if (!selectedFile) return;

    const { error } = await uploadMedia(profileId, selectedFile, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      media_type: mediaType,
      category: category || undefined
    });

    if (!error) {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
    }
  };

  const handleSignIn = () => {
    setShowAuthRequired(false);
    setShowAuthDialog(true);
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'video': return Video;
      case 'audio': return Music;
      default: return Image;
    }
  };

  const MediaIcon = getMediaIcon();

  if (!isAuthenticated) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Enviar Mídia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Faça login para enviar fotos, vídeos e áudios para o portfólio.
            </p>
            <Button onClick={() => setShowAuthRequired(true)} className="w-full">
              Fazer Login para Enviar
            </Button>
          </CardContent>
        </Card>

        <AuthRequiredDialog
          open={showAuthRequired}
          onOpenChange={setShowAuthRequired}
          action="upload"
          onSignIn={handleSignIn}
        />

        <PublicAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          defaultTab="signin"
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Enviar Mídia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
              required
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MediaIcon className="w-4 h-4" />
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-type">Tipo de Mídia</Label>
            <Select value={mediaType} onValueChange={(value: any) => setMediaType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da mídia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portfolio">Portfólio</SelectItem>
                <SelectItem value="shows">Shows</SelectItem>
                <SelectItem value="backstage">Backstage</SelectItem>
                <SelectItem value="studio">Estúdio</SelectItem>
                <SelectItem value="promotional">Promocional</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a mídia..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enviar Mídia
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}