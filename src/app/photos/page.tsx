'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  ArrowLeft, 
  Loader2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function PhotosPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      loadExistingPhotos();
    }
  }, [user]);

  const loadExistingPhotos = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_reference_photos')
        .select('photo_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingPhotos(data.map(p => p.photo_url));
      }
    } catch (err) {
      console.error('Erro ao carregar fotos existentes:', err);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (selectedFiles.length + newFiles.length < 1) {
        // Validar tamanho (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('Arquivo muito grande. Máximo 10MB por foto.');
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          setError('Apenas imagens são permitidas.');
          return;
        }

        newFiles.push(file);
        const url = URL.createObjectURL(file);
        newPreviews.push(url);
      }
    });

    setSelectedFiles([...selectedFiles, ...newFiles].slice(0, 1));
    setPreviewUrls([...previewUrls, ...newPreviews].slice(0, 1));
  };

  const removePhoto = (index: number) => {
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
    setSelectedFiles(newFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Selecione pelo menos 1 foto');
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Deletar fotos antigas do usuário
      const { error: deleteError } = await supabase
        .from('user_reference_photos')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erro ao deletar fotos antigas:', deleteError);
      }

      // Upload de cada foto
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Converter para base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove o prefixo data:image/...;base64,
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}_${i}.${fileExt}`;

        console.log('Fazendo upload da foto:', fileName);

        // Upload via API route para contornar RLS
        const uploadResponse = await fetch('/api/upload-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName,
            fileBase64: base64,
            contentType: file.type,
            userId: user.id
          })
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Erro ao fazer upload');
        }

        const { publicUrl } = await uploadResponse.json();
        console.log('Upload bem-sucedido, URL:', publicUrl);

        // Salvar no banco de dados
        const { error: insertError } = await supabase
          .from('user_reference_photos')
          .insert({
            user_id: user.id,
            photo_url: publicUrl
          });

        if (insertError) {
          console.error('Erro ao salvar no banco:', insertError);
          throw new Error(`Erro ao salvar foto ${i + 1} no banco: ${insertError.message}`);
        }

        console.log('Foto salva no banco com sucesso');
      }

      setSuccess(true);
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      // Recarregar fotos existentes
      await loadExistingPhotos();

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload das fotos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Gerenciar Fotos</h1>
              <p className="text-xs text-white/70">Sua foto de corpo inteiro</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Message */}
        {success && (
          <Card className="mb-6 bg-green-500/20 backdrop-blur-sm border-green-400/30">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-white">
                <Check className="w-5 h-5" />
                <p className="font-semibold">Foto salva com sucesso! Redirecionando...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-500/20 backdrop-blur-sm border-red-400/30">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3 text-white">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mb-6 bg-blue-500/20 backdrop-blur-sm border-blue-400/30">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-white space-y-2">
                <p className="font-semibold">Instruções importantes:</p>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  <li>Faça upload de 1 foto sua de corpo inteiro</li>
                  <li>Use foto com boa iluminação e fundo neutro</li>
                  <li>Evite roupas muito largas ou volumosas</li>
                  <li>A foto será usada para gerar suas imagens virtuais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-[#002f5c]">Foto Atual</CardTitle>
              <CardDescription>
                Esta é a foto que será usada para gerar suas imagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {existingPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={photoUrl}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-[#002f5c]">
              {existingPhotos.length > 0 ? 'Atualizar Foto' : 'Adicionar Foto'}
            </CardTitle>
            <CardDescription>
              {previewUrls.length}/1 foto selecionada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview Grid */}
            <div className="grid grid-cols-1 gap-4">
              {[0].map((index) => (
                <div key={index} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 max-w-md mx-auto w-full">
                  {previewUrls[index] ? (
                    <>
                      <Image
                        src={previewUrls[index]}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Foto selecionada
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm">Selecione sua foto</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="space-y-4">
              <label htmlFor="photo-upload" className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#002f5c] hover:bg-gray-50 transition-all">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Clique para selecionar foto
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG ou WEBP (máx. 10MB)
                  </p>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={previewUrls.length >= 1}
                />
              </label>

              {previewUrls.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading || previewUrls.length < 1}
                  className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] py-6 text-lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando foto...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Salvar Foto
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
