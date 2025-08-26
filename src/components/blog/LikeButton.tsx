import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { hashEmail } from "@/utils/emailUtils";

interface LikeButtonProps {
  postId: string;
  userEmail?: string;
}

const LikeButton = ({ postId, userEmail }: LikeButtonProps) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLikes();
    if (userEmail) {
      checkUserLike();
    }
  }, [postId, userEmail]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase.rpc('get_post_likes_count', {
        p_post_id: postId
      });

      if (!error) {
        setLikes(Number(data) || 0);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const checkUserLike = async () => {
    if (!userEmail) return;

    try {
      const emailHash = hashEmail(userEmail);
      const { data, error } = await supabase.rpc('user_liked_post_hash', {
        p_post_id: postId,
        p_email_hash: emailHash
      });

      if (!error) {
        setIsLiked(Boolean(data));
      }
    } catch (error) {
      console.error('Error checking user like:', error);
    }
  };

  const handleLike = async () => {
    if (!userEmail) {
      const email = prompt("Digite seu email para curtir:");
      if (!email) return;
      
      setIsLoading(true);
      const emailHash = hashEmail(email);
      
      if (isLiked) {
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId as any)
          .eq('email_hash', emailHash);

        if (!error) {
          setIsLiked(false);
          setLikes(prev => prev - 1);
          toast({ title: "Curtida removida!" });
        }
      } else {
        const { error } = await supabase
          .from('blog_likes')
          .insert([{ post_id: postId, email_hash: emailHash } as any]);

        if (!error) {
          setIsLiked(true);
          setLikes(prev => prev + 1);
          toast({ title: "Obrigado pela curtida!" });
        } else if (error.code === '23505') {
          toast({ title: "Você já curtiu este artigo!" });
        }
      }
      
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const emailHash = hashEmail(userEmail);

    if (isLiked) {
      const { error } = await supabase
        .from('blog_likes')
        .delete()
        .eq('post_id', postId as any)
        .eq('email_hash', emailHash);

      if (!error) {
        setIsLiked(false);
        setLikes(prev => prev - 1);
        toast({ title: "Curtida removida!" });
      }
    } else {
      const { error } = await supabase
        .from('blog_likes')
        .insert([{ post_id: postId, email_hash: emailHash } as any]);

      if (!error) {
        setIsLiked(true);
        setLikes(prev => prev + 1);
        toast({ title: "Obrigado pela curtida!" });
      } else if (error.code === '23505') {
        toast({ title: "Você já curtiu este artigo!" });
      }
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all",
        isLiked && "bg-red-500 hover:bg-red-600 text-white"
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          isLiked && "fill-current"
        )} 
      />
      {likes} {likes === 1 ? "Curtida" : "Curtidas"}
    </Button>
  );
};

export default LikeButton;