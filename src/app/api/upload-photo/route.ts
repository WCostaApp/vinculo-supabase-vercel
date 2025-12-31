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

    // Converter base64 para buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    // Upload usando service role (contorna RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('reference-photos')
      .upload(fileName, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erro no upload:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('reference-photos')
      .getPublicUrl(fileName);

    return NextResponse.json({ publicUrl });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
