import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔴 API delete-image chamada');
  
  try {
    const body = await request.json();
    console.log('📦 Body recebido:', body);
    
    const { imageId, userId } = body;

    if (!imageId || !userId) {
      console.error('❌ Dados faltando:', { imageId, userId });
      return NextResponse.json(
        { error: 'imageId e userId são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('✅ Dados validados:', { imageId, userId });

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔑 Variáveis de ambiente:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlValue: supabaseUrl,
      serviceKeyPrefix: supabaseServiceKey?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente faltando');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta - variáveis de ambiente faltando' },
        { status: 500 }
      );
    }

    console.log('🔧 Criando cliente Supabase Admin...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🗑️ Tentando excluir imagem do banco...');
    
    // Primeiro, verificar se a imagem existe
    const { data: existingImage, error: fetchError } = await supabaseAdmin
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .single();

    console.log('🔍 Verificação de existência:', {
      exists: !!existingImage,
      error: fetchError,
      image: existingImage
    });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar imagem:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao verificar imagem', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!existingImage) {
      console.error('❌ Imagem não encontrada');
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }

    // Excluir imagem
    const { data: deleteData, error: deleteError } = await supabaseAdmin
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)
      .select();

    console.log('🗑️ Resultado da exclusão:', {
      data: deleteData,
      error: deleteError
    });

    if (deleteError) {
      console.error('❌ Erro ao excluir imagem:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao excluir imagem', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ Imagem excluída com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Imagem excluída com sucesso'
    });

  } catch (error: any) {
    console.error('💥 Erro geral ao excluir imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir imagem', details: error.message },
      { status: 500 }
    );
  }
}
