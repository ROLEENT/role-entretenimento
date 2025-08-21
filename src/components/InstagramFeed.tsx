import { Instagram, Heart, MessageCircle, Share } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const InstagramFeed = () => {
  const posts = [
    {
      id: 1,
      image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      caption: "Que noite incrível no Audio Club! 🎶 #rolesp #noitesp",
      likes: 847,
      comments: 23,
      timestamp: "2h"
    },
    {
      id: 2,
      image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      caption: "Festival de eletrônica chegando! Preparem-se 🔥",
      likes: 1254,
      comments: 67,
      timestamp: "5h"
    },
    {
      id: 3,
      image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      caption: "Rock nacional em alta! Confira os shows desta semana",
      likes: 523,
      comments: 15,
      timestamp: "1d"
    },
    {
      id: 4,
      image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      caption: "Funk carioca dominando SP! Vem pro rolê 🎤",
      likes: 1876,
      comments: 89,
      timestamp: "2d"
    },
    {
      id: 5,
      image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
      caption: "Jazz à meia-noite no Beco 203 🎷 #culturasp",
      likes: 412,
      comments: 8,
      timestamp: "3d"
    },
    {
      id: 6,
      image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
      caption: "Beach club season! Warung está pegando fogo ☀️",
      likes: 2341,
      comments: 156,
      timestamp: "4d"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Instagram className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-foreground">
              @role.ent
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acompanhe nosso Instagram para ficar por dentro de tudo que rola na cena musical
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 bg-card border-border overflow-hidden">
              <div className="relative">
                <img 
                  src={post.image} 
                  alt={`Post ${post.id}`}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-3 lg:hidden">
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{post.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center mx-auto">
            <Instagram className="w-5 h-5 mr-2" />
            Seguir no Instagram
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;