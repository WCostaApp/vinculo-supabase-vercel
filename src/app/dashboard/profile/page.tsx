'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar } from '@/components/custom/Sidebar';
import { User, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  if (!user || !profile) {
    return null;
  }

  // Iniciais do usuário para fallback
  const initials = profile.email
    .split('@')[0]
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Sidebar showLogo={true} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        {/* Card de Perfil */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-[#002f5c]">Meu Perfil</CardTitle>
            <CardDescription>
              Visualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Atual */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-[#002f5c]">
                  <AvatarImage src={profile.avatar_url || undefined} alt="Foto de perfil" />
                  <AvatarFallback className="bg-gradient-to-br from-[#002f5c] to-[#004080] text-white text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Badge de usuário */}
                <div className="absolute bottom-0 right-0 bg-[#002f5c] rounded-full p-2 border-4 border-white">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {profile.avatar_url ? 'Foto de perfil' : 'Sem foto de perfil'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mt-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#002f5c]">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-[#002f5c]">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Plano</span>
              <span className="font-medium text-[#002f5c] capitalize">{profile.plan_type}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Código de Indicação</span>
              <span className="font-mono font-medium text-[#002f5c]">{profile.referral_code}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
