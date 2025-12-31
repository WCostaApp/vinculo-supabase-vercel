import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role key para contornar RLS
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

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileBase64, contentType, userId } = await request.json();

    if (!fileName || !fileBase64 || !contentType || !userId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // 1. Buscar avatar_url antigo do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
    }

    // 2. Se existe avatar antigo, deletar do storage
    if (userData?.avatar_url) {
      // Extrair o path completo do arquivo da URL
      const urlParts = userData.avatar_url.split('/storage/v1/object/public/avatars/');
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1];
        
        const { error: deleteError } = await supabaseAdmin.storage
          .from('avatars')
          .remove([oldFilePath]);

        if (deleteError) {
          console.error('Erro ao deletar avatar antigo:', deleteError);
          // Continua mesmo se falhar a deleção (arquivo pode não existir mais)
        }
      }
    }

    // 3. Criar nome de arquivo único com userId para isolamento
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${userId}/${Date.now()}.${fileExtension}`;

    // 4. Converter base64 para buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    // 5. Upload do novo avatar usando service role (contorna RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(uniqueFileName, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erro no upload:', error);
      
      // Se o bucket não existe, retornar mensagem específica
      if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
        return NextResponse.json(
          { 
            error: 'Bucket de avatares não configurado. Por favor, crie o bucket "avatars" no Supabase Storage com acesso público.',
            details: error.message 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Erro no upload: ${error.message}` },
        { status: 500 }
      );
    }

    // 6. Obter URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(uniqueFileName);

    // 7. Atualizar avatar_url no banco de dados
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar avatar_url:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      publicUrl,
      message: 'Avatar atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
