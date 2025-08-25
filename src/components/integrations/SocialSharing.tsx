import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Copy, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  MessageCircle,
  Mail,
  ExternalLink,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialSharingProps {
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  eventImage?: string;
  eventUrl: string;
  hashtags?: string[];
  className?: string;
}

interface ShareTemplate {
  platform: string;
  icon: React.ComponentType<any>;
  color: string;
  generateUrl: (content: ShareContent) => string;
  maxLength?: number;
  tips: string[];
}

interface ShareContent {
  title: string;
  description: string;
  url: string;
  hashtags: string;
  image?: string;
}

export function SocialSharing({ 
  eventTitle, 
  eventDescription, 
  eventDate, 
  eventLocation, 
  eventImage, 
  eventUrl,
  hashtags = [],
  className = "" 
}: SocialSharingProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(hashtags);
  const [newHashtag, setNewHashtag] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareTemplates: ShareTemplate[] = [
    {
      platform: 'Instagram',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      maxLength: 2200,
      generateUrl: () => 'https://www.instagram.com',
      tips: [
        'Use até 30 hashtags para maior alcance',
        'Adicione Stories para engajamento imediato',
        'Marque o local do evento',
        'Use imagens em alta qualidade (1080x1080)'
      ]
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      generateUrl: (content) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}&quote=${encodeURIComponent(content.title + ' ' + content.description)}`,
      tips: [
        'Adicione uma descrição detalhada',
        'Use imagens 1200x630 para melhor visualização',
        'Crie um evento no Facebook',
        'Convide amigos interessados'
      ]
    },
    {
      platform: 'Twitter',
      icon: Twitter,
      color: 'from-sky-400 to-sky-500',
      maxLength: 280,
      generateUrl: (content) => 
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.title)}&url=${encodeURIComponent(content.url)}&hashtags=${encodeURIComponent(content.hashtags)}`,
      tips: [
        'Mantenha mensagens curtas e diretas',
        'Use 1-2 hashtags relevantes',
        'Adicione emojis para chamar atenção',
        'Mencione perfis relacionados'
      ]
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-700 to-blue-800',
      generateUrl: (content) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}`,
      tips: [
        'Foque no aspecto profissional/networking',
        'Mencione oportunidades de negócio',
        'Use linguagem mais formal',
        'Destaque palestrantes ou empresas envolvidas'
      ]
    },
    {
      platform: 'WhatsApp',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      generateUrl: (content) => 
        `https://wa.me/?text=${encodeURIComponent(content.title + '\n' + content.description + '\n' + content.url)}`,
      tips: [
        'Ideal para grupos específicos',
        'Adicione informações práticas (horário, local)',
        'Use emojis para destacar informações',
        'Inclua link direto para compra de ingressos'
      ]
    }
  ];

  const generateShareContent = (platform: string): ShareContent => {
    const baseMessage = customMessage || `🎉 ${eventTitle}

📅 ${formatDate(eventDate)}
📍 ${eventLocation}

${eventDescription}

#role #eventos #${eventLocation.replace(/\s+/g, '')}`;

    return {
      title: eventTitle,
      description: customMessage || eventDescription,
      url: eventUrl,
      hashtags: selectedHashtags.join(','),
      image: eventImage
    };
  };

  const handleShare = async (template: ShareTemplate) => {
    const content = generateShareContent(template.platform);
    
    if (template.platform === 'Instagram') {
      // Instagram doesn't support direct sharing URLs, so copy content
      const instagramContent = `${content.title}\n\n${content.description}\n\n${selectedHashtags.map(tag => `#${tag}`).join(' ')}\n\nLink na bio: ${content.url}`;
      
      try {
        await navigator.clipboard.writeText(instagramContent);
        toast.success('Conteúdo copiado! Cole no Instagram.');
      } catch (error) {
        toast.error('Erro ao copiar conteúdo');
      }
      return;
    }

    const shareUrl = template.generateUrl(content);
    
    // Try native sharing first
    if (navigator.share && template.platform === 'WhatsApp') {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: content.url
        });
        return;
      } catch (error) {
        // Fallback to URL opening
      }
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    const content = generateShareContent('generic');
    const textContent = `${content.title}\n\n${content.description}\n\n${selectedHashtags.map(tag => `#${tag}`).join(' ')}\n\n${content.url}`;
    
    try {
      await navigator.clipboard.writeText(textContent);
      toast.success('Conteúdo copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar conteúdo');
    }
  };

  const downloadShareImage = () => {
    if (!eventImage) {
      toast.error('Nenhuma imagem disponível para download');
      return;
    }
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = eventImage;
    link.download = `${eventTitle.replace(/\s+/g, '_')}_share_image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download iniciado!');
  };

  const addHashtag = () => {
    if (newHashtag && !selectedHashtags.includes(newHashtag)) {
      setSelectedHashtags([...selectedHashtags, newHashtag]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(tag => tag !== hashtag));
  };

  const suggestedHashtags = [
    'eventos', 'festa', 'música', 'cultura', 'entretenimento',
    'fimdesemana', 'diversão', 'shows', 'live', 'arte'
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Compartilhamento Social
        </CardTitle>
        <CardDescription>
          Divulgue o evento nas redes sociais e aumente o engajamento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Custom Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem Personalizada</label>
          <Textarea
            placeholder="Digite uma mensagem personalizada para acompanhar o compartilhamento..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Deixe em branco para usar a descrição padrão do evento
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Hashtags</label>
          
          <div className="flex gap-2">
            <Input
              placeholder="Nova hashtag (sem #)"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value.replace('#', ''))}
              onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
            />
            <Button onClick={addHashtag} size="sm">
              Adicionar
            </Button>
          </div>

          {/* Selected Hashtags */}
          <div className="flex flex-wrap gap-2">
            {selectedHashtags.map((hashtag) => (
              <Badge 
                key={hashtag} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => removeHashtag(hashtag)}
              >
                #{hashtag} ×
              </Badge>
            ))}
          </div>

          {/* Suggested Hashtags */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.filter(tag => !selectedHashtags.includes(tag)).map((hashtag) => (
                <Badge 
                  key={hashtag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedHashtags([...selectedHashtags, hashtag])}
                >
                  #{hashtag} +
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </Button>
          
          {eventImage && (
            <Button variant="outline" size="sm" onClick={downloadShareImage}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Imagem
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => window.open(eventUrl, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Evento
          </Button>
        </div>

        <Separator />

        {/* Platform-Specific Sharing */}
        <div className="space-y-4">
          <h4 className="font-medium">Compartilhar em:</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            {shareTemplates.map((template) => {
              const IconComponent = template.icon;
              const content = generateShareContent(template.platform);
              const isOverLimit = template.maxLength && 
                (content.title + content.description + content.hashtags).length > template.maxLength;
              
              return (
                <Card key={template.platform} className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-5`} />
                  
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{template.platform}</span>
                      </div>
                      
                      {isOverLimit && (
                        <Badge variant="destructive" className="text-xs">
                          Muito longo
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleShare(template)}
                      className="w-full mb-3"
                      size="sm"
                      disabled={isOverLimit}
                    >
                      Compartilhar
                    </Button>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Dicas:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {template.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h4 className="font-medium">Preview do Compartilhamento</h4>
          
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex gap-3">
              {eventImage && (
                <img 
                  src={eventImage} 
                  alt={eventTitle}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h5 className="font-medium truncate">{eventTitle}</h5>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {customMessage || eventDescription}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedHashtags.slice(0, 5).map((hashtag) => (
                    <span key={hashtag} className="text-xs text-primary">
                      #{hashtag}
                    </span>
                  ))}
                  {selectedHashtags.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{selectedHashtags.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}