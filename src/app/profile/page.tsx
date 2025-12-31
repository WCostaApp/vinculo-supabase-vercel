'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Mail, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Sidebar } from '@/components/custom/Sidebar';

export default function ProfilePage() {
  const [uploading, setUploading] = useState(false);
  const { user, profile } = useAuth();

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar tamanho do arquivo (máx 2MB para base64)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          // Atualizar perfil do usuário com a foto em base64
          const { error: updateError } = await supabase
            .from('users')
            .update({ profile_photo_url: base64String })
            .eq('id', user.id);

          if (updateError) {
            console.error('Erro do Supabase:', updateError);
            throw new Error(updateError.message || 'Erro ao atualizar foto no banco de dados');
          }

          toast.success('Foto de perfil atualizada com sucesso!');
          
          // Recarregar após pequeno delay para garantir que o banco atualizou
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error: any) {
          console.error('Erro ao atualizar foto:', error);
          toast.error(error?.message || 'Erro ao atualizar foto de perfil');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Erro ao processar imagem');
        setUploading(false);
      };

      // Ler arquivo como base64
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Erro ao processar foto:', error);
      toast.error(error?.message || 'Erro ao processar foto de perfil');
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    if (!profile?.email) return 'U';
    return profile.email.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#004080] to-[#0066cc]">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Sidebar showLogo={true} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-white/70">Gerencie suas informações pessoais e foto de perfil</p>
          </div>

          {/* Card de Foto de Perfil */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Foto de Perfil</CardTitle>
              <CardDescription className="text-white/70">
                Esta é a foto que aparece em seu cadastro e em toda a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Preview da Foto Atual */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
                    <AvatarImage 
                      src={(profile as any)?.profile_photo_url} 
                      alt="Foto de perfil"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white text-[#002f5c] text-4xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white/70 text-sm text-center">
                    {(profile as any)?.profile_photo_url ? 'Foto atual' : 'Nenhuma foto definida'}
                  </p>
                </div>

                {/* Botão de Upload */}
                <div className="flex-1 space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-2">Atualizar Foto</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Escolha uma imagem que represente você. Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                    </p>
                    <input
                      type="file"
                      id="profile-photo-upload-page"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label htmlFor="profile-photo-upload-page">
                      <Button
                        variant="outline"
                        className="w-full bg-white text-[#002f5c] hover:bg-white/90"
                        disabled={uploading}
                        asChild
                      >
                        <span className="cursor-pointer flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Enviando...' : 'Escolher Nova Foto'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Informações do Perfil */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Informações da Conta</CardTitle>
              <CardDescription className="text-white/70">
                Detalhes da sua conta na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail className="w-5 h-5 text-white/70" />
                    <span className="text-white/70 text-sm font-medium">Email</span>
                  </div>
                  <p className="text-white font-semibold">{profile?.email || 'N/A'}</p>
                </div>

                {/* Plano */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="w-5 h-5 text-white/70" />
                    <span className="text-white/70 text-sm font-medium">Plano</span>
                  </div>
                  <p className="text-white font-semibold capitalize">{profile?.plan_type || 'Free'}</p>
                </div>

                {/* Créditos */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-white/70" />
                    <span className="text-white/70 text-sm font-medium">Créditos Disponíveis</span>
                  </div>
                  <p className="text-white font-semibold">{profile?.credits || 0}</p>
                </div>

                {/* Data de Criação */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-white/70" />
                    <span className="text-white/70 text-sm font-medium">Membro desde</span>
                  </div>
                  <p className="text-white font-semibold">{formatDate(profile?.created_at || null)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
