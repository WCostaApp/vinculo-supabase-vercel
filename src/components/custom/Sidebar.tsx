'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, User, LayoutDashboard, Upload, LogOut, Menu, Image, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SidebarProps {
  showLogo?: boolean;
}

export function Sidebar({ showLogo = true }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

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
          const { data, error: updateError } = await supabase
            .from('users')
            .update({ profile_photo_url: base64String })
            .eq('id', user.id)
            .select();

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

      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao sair da conta');
    }
  };

  const getUserInitials = () => {
    if (!profile?.email) return 'U';
    return profile.email.charAt(0).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {showLogo ? (
          <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#002f5c]" />
            </div>
            <span className="text-xl font-bold text-white">Fashion.ai</span>
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gradient-to-b from-[#002f5c] to-[#004080] border-r border-white/20 p-0">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#002f5c]" />
              </div>
              <span className="text-xl font-bold text-white">Fashion.ai</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Perfil */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-3">
                Perfil
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-16 h-16 border-2 border-white/20">
                    <AvatarImage src={(profile as any)?.profile_photo_url} />
                    <AvatarFallback className="bg-white text-[#002f5c] text-xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{profile?.email}</p>
                    <p className="text-white/60 text-sm capitalize">{profile?.plan_type}</p>
                  </div>
                </div>
                
                <div>
                  <input
                    type="file"
                    id="profile-photo-upload"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="profile-photo-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      disabled={uploading}
                      asChild
                    >
                      <span className="cursor-pointer flex items-center justify-center">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Enviando...' : 'Trocar Foto de Perfil'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Painel de Controle */}
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-3">
                Menu
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 h-12"
                  onClick={() => {
                    router.push('/dashboard');
                    setOpen(false);
                  }}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Início
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 h-12"
                  onClick={() => {
                    router.push('/profile');
                    setOpen(false);
                  }}
                >
                  <User className="w-5 h-5 mr-3" />
                  Meu Perfil
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 h-12"
                  onClick={() => {
                    router.push('/dashboard/credits');
                    setOpen(false);
                  }}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  Painel de Controle
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10 h-12"
                  onClick={() => {
                    router.push('/gallery');
                    setOpen(false);
                  }}
                >
                  <Image className="w-5 h-5 mr-3" />
                  Galeria
                </Button>
              </div>
            </div>
          </div>

          {/* Footer - Logout */}
          <div className="p-4 border-t border-white/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 h-12"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
