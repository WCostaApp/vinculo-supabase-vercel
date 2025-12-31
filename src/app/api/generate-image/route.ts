import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import * as fal from '@fal-ai/serverless-client';

// Configurar Fal.ai
fal.config({
  credentials: process.env.FAL_KEY || '7619e24d-26ff-480e-af4c-ff16330f093e:6156edddd11b1e5a12837fdeeb4e2f72'
});

// Cliente com Service Role Key (bypassa RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// UUID válido para conta MASTER
const MASTER_UUID = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const clothType = formData.get('clothType') as string || 'upper';
    const clothingDescription = formData.get('clothingDescription') as string || '';

    console.log('Recebendo requisição:', { userId, clothType, hasFile: !!file });

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Arquivo e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se FAL_KEY está configurada
    const falKey = process.env.FAL_KEY || '7619e24d-26ff-480e-af4c-ff16330f093e:6156edddd11b1e5a12837fdeeb4e2f72';
    if (!falKey) {
      console.error('FAL_KEY não configurada');
      return NextResponse.json(
        { error: 'API da Fal.ai não configurada. Configure a variável FAL_KEY.' },
        { status: 500 }
      );
    }

    console.log('FAL_KEY configurada:', falKey.substring(0, 20) + '...');

    // Garantir que o perfil MASTER existe no banco
    if (userId === MASTER_UUID) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', MASTER_UUID)
        .single();

      if (!existingProfile) {
        console.log('Criando perfil MASTER no banco...');
        await supabaseAdmin
          .from('profiles')
          .insert({
            id: MASTER_UUID,
            images_remaining: 999999,
            bonus_credits: 0
          });
      }
    }

    // PASSO 1: Buscar foto de perfil do usuário (FOTO A - foto de referência)
    console.log('Buscando foto de perfil do usuário (FOTO A)...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('profile_photo_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
    }

    const userReferencePhoto = userData?.profile_photo_url;

    if (!userReferencePhoto) {
      console.error('Usuário não possui foto de perfil cadastrada');
      return NextResponse.json(
        { error: 'Você precisa adicionar uma foto de perfil primeiro. Vá no menu lateral e clique em "Trocar Foto de Perfil".' },
        { status: 400 }
      );
    }

    console.log('Foto de perfil encontrada (FOTO A):', userReferencePhoto.substring(0, 50) + '...');

    // PASSO 2: Upload da imagem de roupa (FOTO B) para o Supabase Storage
    const fileName = `clothing_${userId}_${Date.now()}.jpg`;
    console.log('Fazendo upload da imagem de roupa (FOTO B):', fileName);
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('clothing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return NextResponse.json(
        { error: `Erro ao fazer upload da imagem: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('Upload bem-sucedido:', uploadData);

    // Obter URL pública da imagem de roupa (FOTO B)
    const { data: { publicUrl: clothingImageUrl } } = supabaseAdmin.storage
      .from('clothing-images')
      .getPublicUrl(fileName);

    console.log('URL pública da imagem de roupa (FOTO B):', clothingImageUrl);

    // PASSO 3: Testar acessibilidade das URLs antes de enviar para Fal.ai
    console.log('Testando acessibilidade das URLs...');
    
    try {
      // Para foto de perfil em base64, não precisamos testar URL
      if (!userReferencePhoto.startsWith('data:')) {
        const refResponse = await fetch(userReferencePhoto, { method: 'HEAD' });
        console.log('Status foto referência:', refResponse.status, refResponse.statusText);

        if (!refResponse.ok) {
          throw new Error(`Foto de perfil não está acessível (Status: ${refResponse.status}). Tente fazer upload novamente da sua foto de perfil.`);
        }
      } else {
        console.log('Foto de perfil está em formato base64 (OK)');
      }

      const clothingResponse = await fetch(clothingImageUrl, { method: 'HEAD' });
      console.log('Status foto roupa:', clothingResponse.status, clothingResponse.statusText);

      if (!clothingResponse.ok) {
        throw new Error(`Foto da roupa não está acessível (Status: ${clothingResponse.status}). Tente fazer upload novamente.`);
      }
    } catch (fetchError: any) {
      console.error('Erro ao testar URLs:', fetchError);
      return NextResponse.json(
        { error: fetchError.message || 'Erro ao verificar acessibilidade das imagens' },
        { status: 500 }
      );
    }

    // PASSO 4: Chamar API da Fal.ai para Virtual Try-On
    // Usando os campos CORRETOS conforme documentação: human_image_url, garment_image_url, cloth_type
    console.log('Chamando API da Fal.ai (cat-vton) para Virtual Try-On...');
    console.log('Parâmetros enviados:', {
      human_image_url: userReferencePhoto.startsWith('data:') ? 'base64 image' : userReferencePhoto,
      garment_image_url: clothingImageUrl,
      cloth_type: clothType
    });
    
    try {
      // Usar modelo CORRETO: fal-ai/cat-vton com campos corretos
      const result: any = await fal.subscribe('fal-ai/cat-vton', {
        input: {
          human_image_url: userReferencePhoto,
          garment_image_url: clothingImageUrl,
          cloth_type: clothType, // 'upper', 'lower', 'overall', 'outer'
          // Parâmetros opcionais conforme documentação
          num_inference_steps: 50,
          guidance_scale: 2.5,
          seed: Math.floor(Math.random() * 1000000)
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Fal.ai processando:', update.logs?.map(log => log.message));
          }
        }
      });

      console.log('Resultado completo da Fal.ai:', JSON.stringify(result, null, 2));

      // Extrair URL da imagem gerada conforme estrutura da resposta da Fal.ai
      let generatedImageUrl: string | null = null;

      // Estrutura esperada: result.image.url (conforme documentação)
      if (result?.image?.url) {
        generatedImageUrl = result.image.url;
      } else if (result?.data?.image?.url) {
        generatedImageUrl = result.data.image.url;
      } else if (result?.images && Array.isArray(result.images) && result.images.length > 0) {
        generatedImageUrl = result.images[0].url || result.images[0];
      } else if (result?.data?.images && Array.isArray(result.data.images) && result.data.images.length > 0) {
        generatedImageUrl = result.data.images[0].url || result.data.images[0];
      } else if (typeof result === 'string' && result.startsWith('http')) {
        generatedImageUrl = result;
      }

      if (!generatedImageUrl) {
        console.error('Estrutura de resposta inesperada da Fal.ai:', result);
        throw new Error('Fal.ai não retornou imagem no formato esperado. Verifique os logs para mais detalhes.');
      }

      console.log('Imagem gerada pela Fal.ai:', generatedImageUrl);

      // Fazer download da imagem gerada pela Fal.ai
      const imageResponse = await fetch(generatedImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Erro ao baixar imagem gerada: ${imageResponse.statusText}`);
      }
      
      const imageBlob = await imageResponse.blob();
      
      // Upload da imagem gerada para o Supabase Storage
      const generatedFileName = `generated_${userId}_${Date.now()}.png`;
      console.log('Fazendo upload da imagem gerada:', generatedFileName);
      
      const { data: generatedUploadData, error: generatedUploadError } = await supabaseAdmin.storage
        .from('clothing-images')
        .upload(generatedFileName, imageBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        });

      let finalImageUrl: string;

      if (generatedUploadError) {
        console.error('Erro no upload da imagem gerada:', generatedUploadError);
        // Usar URL da Fal.ai diretamente se upload falhar
        finalImageUrl = generatedImageUrl;
      } else {
        // Obter URL pública da imagem gerada
        const { data: { publicUrl: generatedPublicUrl } } = supabaseAdmin.storage
          .from('clothing-images')
          .getPublicUrl(generatedFileName);
        
        finalImageUrl = generatedPublicUrl;
        console.log('URL pública da imagem gerada:', finalImageUrl);
      }

      // Inserir no banco de dados
      console.log('Tentando inserir no banco...');
      const { data: generatedImage, error: insertError } = await supabaseAdmin
        .from('generated_images')
        .insert({
          user_id: userId,
          image_url: finalImageUrl,
          clothing_type: clothType,
          clothing_description: clothingDescription || null
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao inserir no banco:', insertError);
        return NextResponse.json(
          { error: `Erro ao salvar imagem no banco: ${insertError.message}` },
          { status: 500 }
        );
      }

      console.log('Inserção bem-sucedida:', generatedImage);

      // Buscar ou criar perfil do usuário
      let { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('images_remaining, bonus_credits')
        .eq('id', userId)
        .single();

      // Se perfil não existe, criar um novo
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Perfil não existe, criando...');
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            images_remaining: userId === MASTER_UUID ? 999999 : 5,
            bonus_credits: 0
          })
          .select('images_remaining, bonus_credits')
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
        } else {
          profile = newProfile;
          console.log('Perfil criado:', profile);
        }
      } else if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Decrementar créditos do usuário (exceto MASTER)
      if (profile && userId !== MASTER_UUID) {
        const newCredits = Math.max(0, profile.images_remaining - 1);
        const newBonusCredits = profile.images_remaining > 0 
          ? profile.bonus_credits 
          : Math.max(0, profile.bonus_credits - 1);

        console.log('Atualizando créditos:', { newCredits, newBonusCredits });

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            images_remaining: newCredits,
            bonus_credits: newBonusCredits
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Erro ao atualizar créditos:', updateError);
        }
      }

      return NextResponse.json({
        success: true,
        image: generatedImage,
        publicUrl: finalImageUrl,
        usedReferencePhoto: true,
        referencePhotoUrl: userReferencePhoto.startsWith('data:') ? 'base64 image' : userReferencePhoto,
        clothingPhotoUrl: clothingImageUrl
      });

    } catch (falError: any) {
      console.error('Erro detalhado na API da Fal.ai:', {
        message: falError.message,
        status: falError.status,
        statusText: falError.statusText,
        body: falError.body,
        response: falError.response,
        stack: falError.stack
      });

      // Tentar extrair mais detalhes do erro
      let errorDetails = '';
      if (falError.body) {
        try {
          const bodyText = typeof falError.body === 'string' 
            ? falError.body 
            : JSON.stringify(falError.body);
          errorDetails = ` Detalhes: ${bodyText}`;
          console.error('Corpo do erro:', bodyText);
        } catch (e) {
          console.error('Não foi possível parsear corpo do erro');
        }
      }

      // Mensagens de erro mais específicas baseadas na documentação Fal.ai
      let errorMessage = 'Erro ao processar imagem com IA';
      
      if (falError.message?.includes('Unprocessable Entity') || falError.message?.includes('422')) {
        errorMessage = `A API não conseguiu processar as imagens. Verifique se: (1) Sua foto de perfil está clara e mostra o corpo inteiro, (2) A foto da roupa está em boa qualidade, (3) Ambas as imagens estão em formato JPG/PNG válido.${errorDetails}`;
      } else if (falError.message?.includes('Invalid API key') || falError.message?.includes('401')) {
        errorMessage = 'Chave da API Fal.ai inválida. Verifique a configuração da FAL_KEY.';
      } else if (falError.message?.includes('quota') || falError.message?.includes('429')) {
        errorMessage = 'Limite de uso da API Fal.ai atingido. Tente novamente mais tarde.';
      } else if (falError.message?.includes('timeout')) {
        errorMessage = 'Tempo limite excedido ao processar imagem. Tente novamente com imagens menores.';
      } else if (falError.message) {
        errorMessage = `Erro da IA: ${falError.message}${errorDetails}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Erro geral:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
