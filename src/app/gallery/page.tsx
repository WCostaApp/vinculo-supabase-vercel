'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface GeneratedImage {
  id: string;
  user_id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadImages();
  }, [user, router]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar imagens:', error);
        throw error;
      }

      setImages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar galeria: ' + (error?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fashion-ai-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao baixar imagem');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      setDeleting(imageId);
      
      if (!user?.id) {
        toast.error('Você precisa estar autenticado para excluir imagens');
        return;
      }

      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          userId: user.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao excluir:', result);
        toast.error(result.error || 'Erro ao excluir imagem');
        throw new Error(result.error || 'Erro ao excluir imagem');
      }

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Imagem excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir imagem:', error);
      toast.error('Erro ao excluir: ' + (error?.message || 'Erro desconhecido'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#004080] to-[#0066cc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#004080] to-[#0066cc]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/generate')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Galeria</h1>
                <p className="text-white/70 mt-1">
                  {images.length} {images.length === 1 ? 'imagem gerada' : 'imagens geradas'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {images.length === 0 ? (
          <Card className="p-12 text-center bg-white/10 backdrop-blur-sm border-white/20">
            <p className="text-white text-lg mb-4">Você ainda não gerou nenhuma imagem</p>
            <Button
              onClick={() => router.push('/generate')}
              className="bg-white text-[#002f5c] hover:bg-white/90"
            >
              Gerar Primeira Imagem
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="group overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.image_url}
                    alt={image.prompt || 'Imagem gerada'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDownload(image.image_url, image.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleting === image.id}
                      className="bg-red-500/90 hover:bg-red-600"
                    >
                      {deleting === image.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
                {image.prompt && (
                  <div className="p-3">
                    <p className="text-white/80 text-sm line-clamp-2">{image.prompt}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {new Date(image.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
