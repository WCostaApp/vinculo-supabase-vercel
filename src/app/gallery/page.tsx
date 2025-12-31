'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trash2,
  Loader2,
  ImageIcon,
  Sparkles
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  created_at: string;
  clothing_url?: string;
}

export default function GalleryPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadImages();
    }
  }, [user]);

  const loadImages = async () => {
    try {
      setLoadingImages(true);
      
      console.log('Carregando imagens para usuário:', user?.id);
      
      // Buscar imagens do Supabase via API
      const response = await fetch('/api/get-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });

      const result = await response.json();
      console.log('Resposta da API:', result);

      if (!response.ok) {
        console.error('Erro ao buscar imagens:', result.error);
        setImages([]);
      } else {
        setImages(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fashionai-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Minha foto gerada com Fashion AI',
          text: 'Veja como ficou essa roupa em mim!',
          url: imageUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL
      navigator.clipboard.writeText(imageUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleDelete = async (imageId: string) => {
    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
      try {
        // TODO: Implementar exclusão real no Supabase
        setImages(images.filter(img => img.id !== imageId));
      } catch (error) {
        console.error('Erro ao excluir imagem:', error);
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[#002f5c]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Minha Galeria</h1>
                  <p className="text-xs text-white/70">
                    {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/generate')}
              className="bg-white text-[#002f5c] hover:bg-white/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nova Geração
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loadingImages ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : images.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-[#002f5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-[#002f5c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#002f5c] mb-3">
                Sua galeria está vazia
              </h2>
              <p className="text-gray-600 mb-8">
                Comece gerando sua primeira imagem com IA!
              </p>
              <Button
                onClick={() => router.push('/generate')}
                className="bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099]"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Primeira Imagem
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={image.url}
                    alt="Imagem gerada"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDownload(image.url, image.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleShare(image.url)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500/90 hover:bg-red-500 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
