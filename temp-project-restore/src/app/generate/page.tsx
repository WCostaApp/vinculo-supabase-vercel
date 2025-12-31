'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Shirt,
  Footprints,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Tipos de roupa aceitos pela API Fal.ai
type ClothType = 'upper' | 'lower' | 'overall' | 'outer';

// Função para redimensionar e comprimir imagem
async function resizeAndCompressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob com compressão
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao comprimir imagem'));
              return;
            }
            
            // Verificar tamanho e ajustar qualidade se necessário
            const targetMinSize = 200 * 1024; // 200KB
            const targetMaxSize = 500 * 1024; // 500KB
            
            if (blob.size > targetMaxSize) {
              // Se ainda está muito grande, comprimir mais
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Erro ao comprimir imagem'));
                    return;
                  }
                  
                  const compressedFile = new File(
                    [compressedBlob],
                    file.name.replace(/\.[^/.]+$/, '.jpg'),
                    { type: 'image/jpeg' }
                  );
                  
                  console.log('Imagem comprimida:', {
                    tamanhoOriginal: `${(file.size / 1024).toFixed(2)}KB`,
                    tamanhoFinal: `${(compressedFile.size / 1024).toFixed(2)}KB`,
                    dimensoes: `${width}x${height}`
                  });
                  
                  resolve(compressedFile);
                },
                'image/jpeg',
                0.75 // Qualidade mais baixa para reduzir tamanho
              );
            } else {
              // Tamanho OK, usar qualidade padrão
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'),
                { type: 'image/jpeg' }
              );
              
              console.log('Imagem processada:', {
                tamanhoOriginal: `${(file.size / 1024).toFixed(2)}KB`,
                tamanhoFinal: `${(compressedFile.size / 1024).toFixed(2)}KB`,
                dimensoes: `${width}x${height}`
              });
              
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          0.85 // Qualidade 85%
        );
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

export default function GeneratePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [clothingPreview, setClothingPreview] = useState<string | null>(null);
  const [clothType, setClothType] = useState<ClothType>('upper');
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleClothingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessing(true);
      setError(null);
      
      try {
        // Redimensionar e comprimir imagem
        const processedFile = await resizeAndCompressImage(file);
        setClothingImage(processedFile);
        
        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setClothingPreview(reader.result as string);
        };
        reader.readAsDataURL(processedFile);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
        setError('Erro ao processar imagem. Tente outro arquivo.');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!clothingImage) {
      setError('Por favor, faça upload de uma imagem de roupa');
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    if (profile.images_remaining + profile.bonus_credits <= 0) {
      setError('Você não tem créditos suficientes. Faça upgrade do seu plano!');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', clothingImage);
      formData.append('userId', user.id);
      formData.append('clothType', clothType);

      console.log('Enviando requisição para API com cloth_type:', clothType);

      // Chamar API route que usa Service Role Key (bypassa RLS)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }

      // Redirecionar para galeria após sucesso
      console.log('Redirecionando para galeria...');
      router.push('/gallery');
    } catch (err) {
      console.error('Erro no handleGenerate:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar imagem. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
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
                <Sparkles className="w-6 h-6 text-[#002f5c]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gerar Nova Imagem</h1>
                <p className="text-xs text-white/70">
                  Créditos: {profile.images_remaining + profile.bonus_credits}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-[#002f5c]">Upload da Roupa</CardTitle>
            <CardDescription>
              Faça upload de uma foto da roupa que você quer experimentar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#002f5c] transition-colors">
              <input
                type="file"
                id="clothing-upload"
                accept="image/*"
                onChange={handleClothingUpload}
                className="hidden"
                disabled={processing || generating}
              />
              <label
                htmlFor="clothing-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                {processing ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#002f5c]" />
                    <p className="text-[#002f5c] font-semibold">Processando imagem...</p>
                    <p className="text-sm text-gray-500">Redimensionando e otimizando</p>
                  </div>
                ) : clothingPreview ? (
                  <div className="relative">
                    <img
                      src={clothingPreview}
                      alt="Preview"
                      className="max-w-full max-h-64 rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <p className="text-white font-semibold">Clique para trocar</p>
                    </div>
                    {clothingImage && (
                      <div className="mt-2 text-xs text-gray-500">
                        Tamanho: {(clothingImage.size / 1024).toFixed(2)}KB
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-[#002f5c]/10 rounded-full flex items-center justify-center">
                      <Upload className="w-10 h-10 text-[#002f5c]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#002f5c]">
                        Clique para fazer upload
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG ou JPEG (será otimizado automaticamente)
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Cloth Type Selection */}
            {clothingPreview && (
              <div className="space-y-4">
                <Label className="text-base font-semibold text-[#002f5c]">
                  Tipo de Roupa
                </Label>
                <RadioGroup value={clothType} onValueChange={(value) => setClothType(value as ClothType)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 hover:border-[#002f5c] transition-colors cursor-pointer">
                      <RadioGroupItem value="upper" id="upper" />
                      <Label htmlFor="upper" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Shirt className="w-5 h-5 text-[#002f5c]" />
                        <div>
                          <p className="font-semibold text-[#002f5c]">Parte Superior</p>
                          <p className="text-xs text-gray-500">Camiseta, camisa, regata</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 hover:border-[#002f5c] transition-colors cursor-pointer">
                      <RadioGroupItem value="lower" id="lower" />
                      <Label htmlFor="lower" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Footprints className="w-5 h-5 text-[#002f5c]" />
                        <div>
                          <p className="font-semibold text-[#002f5c]">Parte Inferior</p>
                          <p className="text-xs text-gray-500">Calça, saia, bermuda</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 hover:border-[#002f5c] transition-colors cursor-pointer">
                      <RadioGroupItem value="overall" id="overall" />
                      <Label htmlFor="overall" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Layers className="w-5 h-5 text-[#002f5c]" />
                        <div>
                          <p className="font-semibold text-[#002f5c]">Conjunto</p>
                          <p className="text-xs text-gray-500">Vestido, macacão</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg p-4 hover:border-[#002f5c] transition-colors cursor-pointer">
                      <RadioGroupItem value="outer" id="outer" />
                      <Label htmlFor="outer" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <ShoppingBag className="w-5 h-5 text-[#002f5c]" />
                        <div>
                          <p className="font-semibold text-[#002f5c]">Sobretudo</p>
                          <p className="text-xs text-gray-500">Jaqueta, blazer, casaco</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Dica:</strong> Para melhores resultados, use fotos de roupas com fundo branco ou neutro. 
                A imagem será automaticamente redimensionada e otimizada para melhor processamento.
              </AlertDescription>
            </Alert>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!clothingImage || generating || processing || (profile.images_remaining + profile.bonus_credits <= 0)}
              className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] py-6 text-lg disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando sua imagem...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Imagem
                </>
              )}
            </Button>

            {/* Credits Warning */}
            {profile.images_remaining + profile.bonus_credits <= 0 && (
              <p className="text-sm text-red-500 text-center">
                Você não tem créditos disponíveis. Faça upgrade do seu plano!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mt-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#002f5c]">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#002f5c] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>
              <p>Faça upload de uma foto da roupa que você quer experimentar</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#002f5c] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>
              <p>Selecione o tipo de roupa (parte superior, inferior, conjunto ou sobretudo)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#002f5c] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>
              <p>Nossa IA irá processar a imagem e gerar uma visualização realista</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#002f5c] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                4
              </div>
              <p>Veja o resultado na sua galeria e compartilhe com seus amigos!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
