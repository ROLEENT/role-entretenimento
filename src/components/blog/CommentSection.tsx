import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, Send, Reply } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSecureBlogComments } from "@/hooks/useSecureBlogComments";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { comments, loading, addComment } = useSecureBlogComments(postId);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) {
      toast({ title: "Erro", description: "Preencha todos os campos" });
      return;
    }

    setIsSubmitting(true);

    const result = await addComment(authorName, authorEmail, newComment, replyTo || undefined);

    if (result.success) {
      toast({ title: "Sucesso", description: "Comentário enviado! Será aprovado em breve." });
      setNewComment("");
      setAuthorName("");
      setAuthorEmail("");
      setReplyTo(null);
    } else {
      toast({ title: "Erro", description: "Erro ao enviar comentário" });
    }

    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const topLevelComments = comments.filter(comment => !comment.parent_id);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parent_id === commentId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">Carregando comentários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Comentários ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <Card>
        <CardHeader>
          <h4 className="font-medium">
            {replyTo ? "Responder comentário" : "Deixe seu comentário"}
          </h4>
          {replyTo && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setReplyTo(null)}
            >
              Cancelar resposta
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Seu nome"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Seu email (não será exibido)"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
              />
            </div>
            <Textarea
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Seu email é usado apenas para moderação e nunca será exibido publicamente.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Comentário"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <Card key={comment.id} className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium">{comment.display_name}</h5>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment.id)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Responder
                </Button>
              </div>
              <p className="text-foreground">{comment.content}</p>
              
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <Card key={reply.id} className="mt-4 ml-6 bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h6 className="font-medium text-sm">{reply.display_name}</h6>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Seja o primeiro a comentar neste artigo!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentSection;