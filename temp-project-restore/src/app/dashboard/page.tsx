'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PLANS, SUPPORT_EMAIL } from '@/lib/constants';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Settings, 
  LogOut, 
  Gift,
  Crown,
  Zap,
  Camera,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  Shield
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !mounted || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002f5c] to-[#004080]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS[profile.plan_type];
  const usagePercentage = ((profile.images_total - profile.images_remaining) / profile.images_total) * 100;

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic': return <Zap className="w-5 h-5" />;
      case 'fashion': return <Sparkles className="w-5 h-5" />;
      case 'super': return <Crown className="w-5 h-5" />;
      case 'master': return <Crown className="w-5 h-5 text-yellow-500" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic': return 'bg-blue-500';
      case 'fashion': return 'bg-purple-500';
      case 'super': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'master': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#002f5c]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Fashion.ai</h1>
                <p className="text-xs text-white/70">Beta</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Support Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-3 text-gray-900">Suporte</h3>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1 mr-2">
                        <p className="text-xs text-gray-500 mb-1">Email de suporte:</p>
                        <p className="text-sm font-medium text-gray-900 break-all">{SUPPORT_EMAIL}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyEmail}
                        className="shrink-0"
                      >
                        {emailCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Plan Info Card */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${getPlanColor(profile.plan_type)} rounded-xl flex items-center justify-center text-white`}>
                  {getPlanIcon(profile.plan_type)}
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#002f5c]">{currentPlan.name}</CardTitle>
                  <CardDescription>
                    {profile.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                  </CardDescription>
                </div>
              </div>
              {profile.bonus_credits > 0 && (
                <Badge className="bg-green-500 text-white">
                  <Gift className="w-3 h-3 mr-1" />
                  +{profile.bonus_credits} bônus
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Imagens restantes</span>
                <span className="font-semibold text-[#002f5c]">
                  {profile.images_remaining + profile.bonus_credits} / {profile.images_total}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>

            {profile.plan_type !== 'super' && profile.plan_type !== 'master' && (
              <Button 
                className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099]"
                onClick={() => router.push('/plans')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Main Actions */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="generate" className="data-[state=active]:bg-white data-[state=active]:text-[#002f5c]">
              <Camera className="w-4 h-4 mr-2" />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-white data-[state=active]:text-[#002f5c]">
              <Upload className="w-4 h-4 mr-2" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:text-[#002f5c]">
              <ImageIcon className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#002f5c]">Gerar Nova Imagem</CardTitle>
                <CardDescription>
                  Faça upload de uma roupa e veja como ficaria em você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] py-8 text-lg"
                  onClick={() => router.push('/generate')}
                  disabled={profile.images_remaining + profile.bonus_credits <= 0}
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Começar Geração
                </Button>
                
                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-blue-900 mb-1">Sua privacidade é prioridade</p>
                      <p className="text-xs leading-relaxed">
                        Ao subir sua foto, você autoriza o processamento exclusivo para o provador virtual. 
                        Suas imagens são processadas de forma segura e deletadas automaticamente dos nossos 
                        servidores após a geração do look. Não armazenamos seus dados biométricos.
                      </p>
                    </div>
                  </div>
                </div>

                {profile.images_remaining + profile.bonus_credits <= 0 && (
                  <p className="text-sm text-red-500 text-center mt-4">
                    Você não tem imagens disponíveis. Faça upgrade do seu plano!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#002f5c]">Minhas Fotos</CardTitle>
                <CardDescription>
                  Gerencie suas 3 fotos de corpo inteiro (atualizável 1x por semana)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] py-6"
                  onClick={() => router.push('/photos')}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Gerenciar Fotos
                </Button>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-blue-900 mb-1">Sua privacidade é prioridade</p>
                      <p className="text-xs leading-relaxed">
                        Ao subir sua foto, você autoriza o processamento exclusivo para o provador virtual. 
                        Suas imagens são processadas de forma segura e deletadas automaticamente dos nossos 
                        servidores após a geração do look. Não armazenamos seus dados biométricos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#002f5c]">Galeria</CardTitle>
                <CardDescription>
                  Veja todas as imagens que você gerou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] py-6"
                  onClick={() => router.push('/gallery')}
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Ver Galeria
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Referral Card */}
        <Card className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-xl text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              Indique e Ganhe
            </CardTitle>
            <CardDescription className="text-white/90">
              Ganhe 10 créditos para cada amigo que assinar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
              <p className="text-sm mb-2">Seu código de indicação:</p>
              <p className="text-2xl font-bold tracking-wider">{profile.referral_code}</p>
            </div>
            <Button 
              className="w-full bg-white text-green-600 hover:bg-white/90"
              onClick={() => {
                navigator.clipboard.writeText(profile.referral_code);
                alert('Código copiado!');
              }}
            >
              Copiar Código
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
