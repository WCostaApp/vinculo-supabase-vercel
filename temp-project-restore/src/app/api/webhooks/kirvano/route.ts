import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tipos de eventos da Kirvano
type KirvanoEventType = 
  | 'payment.approved' 
  | 'payment.pending' 
  | 'payment.cancelled' 
  | 'subscription.created'
  | 'subscription.cancelled';

interface KirvanoWebhookPayload {
  event: KirvanoEventType;
  data: {
    payment_id: string;
    customer_email: string;
    customer_id?: string;
    amount: number;
    status: 'approved' | 'pending' | 'cancelled';
    plan_type?: 'basic' | 'fashion' | 'super';
    metadata?: {
      user_id?: string;
      referral_code?: string;
    };
  };
  created_at: string;
}

// Créditos de bônus por plano
const REFERRAL_BONUS_CREDITS: Record<string, number> = {
  basic: 10,    // 10 créditos por indicação de plano básico
  fashion: 25,  // 25 créditos por indicação de plano fashion
  super: 50,    // 50 créditos por indicação de plano super
};

export async function POST(request: NextRequest) {
  try {
    const payload: KirvanoWebhookPayload = await request.json();

    console.log('Webhook Kirvano recebido:', payload);

    // Verificar se é um evento de pagamento aprovado
    if (payload.event === 'payment.approved' && payload.data.status === 'approved') {
      const { customer_email, plan_type, metadata } = payload.data;

      // Buscar o usuário pelo email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', customer_email)
        .single();

      if (userError || !user) {
        console.error('Usuário não encontrado:', customer_email);
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Atualizar o plano do usuário
      if (plan_type) {
        const imagesPerPlan = {
          basic: 30,
          fashion: 100,
          super: 300,
        };

        await supabase
          .from('users')
          .update({
            plan_type,
            images_remaining: imagesPerPlan[plan_type],
            images_total: imagesPerPlan[plan_type],
            subscription_status: 'active',
          })
          .eq('id', user.id);
      }

      // Processar indicação se o usuário foi indicado por alguém
      if (user.referred_by) {
        // Buscar a indicação pendente
        const { data: referral, error: referralError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referred_id', user.id)
          .eq('status', 'pending')
          .single();

        if (!referralError && referral) {
          // Buscar o usuário que fez a indicação
          const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('*')
            .eq('id', referral.referrer_id)
            .single();

          if (!referrerError && referrer) {
            // Calcular créditos de bônus baseado no plano
            const bonusCredits = REFERRAL_BONUS_CREDITS[plan_type || 'basic'] || 10;

            // Adicionar créditos ao usuário que indicou
            const newBonusCredits = (referrer.bonus_credits || 0) + bonusCredits;
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 6); // Créditos expiram em 6 meses

            await supabase
              .from('users')
              .update({
                bonus_credits: newBonusCredits,
                bonus_credits_expiry: expiryDate.toISOString(),
              })
              .eq('id', referrer.id);

            // Atualizar status da indicação para 'completed'
            await supabase
              .from('referrals')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', referral.id);

            console.log(`✅ Indicação completada! ${referrer.email} recebeu ${bonusCredits} créditos`);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Pagamento processado com sucesso',
      });
    }

    // Outros eventos podem ser tratados aqui
    return NextResponse.json({
      success: true,
      message: 'Evento recebido',
    });

  } catch (error) {
    console.error('Erro ao processar webhook Kirvano:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Kirvano está funcionando',
    timestamp: new Date().toISOString(),
  });
}
