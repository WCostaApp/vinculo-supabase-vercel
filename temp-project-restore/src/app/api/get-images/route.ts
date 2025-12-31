import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('Buscando imagens para usuário:', userId);

    // Buscar imagens do usuário
    const { data: images, error } = await supabaseAdmin
      .from('generated_images')
      .select('id, image_url, created_at, clothing_type, clothing_description')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar imagens', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Encontradas ${images?.length || 0} imagens`);

    // Mapear para o formato esperado pelo frontend
    const mappedImages = (images || []).map(img => ({
      id: img.id,
      url: img.image_url,
      created_at: img.created_at,
      clothing_url: img.image_url
    }));

    return NextResponse.json({
      success: true,
      data: mappedImages
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
