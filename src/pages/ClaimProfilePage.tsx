import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Shield, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

interface Profile {
  id: string;
  handle: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  user_id?: string;
  entity_type: string;
}

const ClaimProfilePage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    claimCode: ''
  });

  useEffect(() => {
    if (handle) {
      fetchProfile();
    }
  }, [handle]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('entity_profiles')
        .select('*')
        .eq('handle', handle)
        .is('user_id', null)
        .single();

      if (error || !data) {
        toast.error('Perfil não encontrado ou já reivindicado');
        navigate('/');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.claimCode !== handle) {
      toast.error('Código de reivindicação incorreto');
      return;
    }

    setClaiming(true);

    try {
      const { data, error } = await supabase.functions.invoke('link-profile', {
        body: {
          profileId: profile!.id,
          email: formData.email,
          password: formData.password,
          claimCode: formData.claimCode
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success('Perfil reivindicado com sucesso!');
      navigate('/auth?message=claim-success');
      
    } catch (error: any) {
      console.error('Error claiming profile:', error);
      toast.error(error.message || 'Erro ao reivindicar perfil');
    } finally {
      setClaiming(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Reivindicar Perfil
              </h1>
              <p className="text-muted-foreground">
                Reivindique este perfil para ter acesso completo às funcionalidades
              </p>
            </div>
          </div>

          {/* Profile Preview */}
          <Card className="mb-6 shadow-elevated border-0 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  <CardDescription className="text-base">@{profile.handle}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {profile.entity_type === 'artist' ? 'Artista' : 
                     profile.entity_type === 'venue' ? 'Local' : 'Produtor'}
                  </Badge>
                </div>
              </div>
              {profile.bio && (
                <p className="text-muted-foreground mt-4">{profile.bio}</p>
              )}
            </CardHeader>
          </Card>

          {/* Claim Form */}
          <Card className="shadow-elevated border-0 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados para Reivindicação
              </CardTitle>
              <CardDescription>
                Preencha os dados abaixo para reivindicar este perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClaim} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claimCode">Código de Confirmação</Label>
                  <Input
                    id="claimCode"
                    placeholder={`Digite "${handle}" para confirmar`}
                    value={formData.claimCode}
                    onChange={handleInputChange('claimCode')}
                    required
                    disabled={claiming}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite exatamente "@{handle}" para confirmar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                    disabled={claiming}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      minLength={6}
                      disabled={claiming}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      required
                      minLength={6}
                      disabled={claiming}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-medium"
                  disabled={claiming}
                >
                  {claiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reivindicar Perfil
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClaimProfilePage;