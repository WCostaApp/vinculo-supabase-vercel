import { NextRequest, NextResponse } from 'next/server';
import { 
  validateWebhookSignature, 
  processReferralCommission,
  kirvanoConfig,
  type KirvanoWebhookPayload 
} from '@/lib/kirvano';

/**
 * Webhook da Kirvano
 * 
 * Este endpoint recebe notificações da Kirvano sobre:
 * - Compras completadas
 * - Assinaturas criadas/canceladas
 * - Reembolsos processados
 * - Comissões de afiliados
 * 
 * URL do webhook: https://seu-dominio.com/api/webhooks/kirvano
 */

export async function POST(request: NextRequest) {
  try {
    // 1. Obter o payload do webhook
    const rawBody = await request.text();
    const payload: KirvanoWebhookPayload = JSON.parse(rawBody);

    // 2. Validar assinatura do webhook (segurança)
    const signature = request.headers.get('x-kirvano-signature') || '';
    const isValid = validateWebhookSignature(
      rawBody,
      signature,
      kirvanoConfig.apiSecret
    );

    if (!isValid) {
      console.error('Assinatura inválida do webhook Kirvano');
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    // 3. Processar evento baseado no tipo
    console.log(`Webhook Kirvano recebido: ${payload.event}`, payload.data);

    switch (payload.event) {
      case 'purchase.completed':
        await handlePurchaseCompleted(payload);
        break;

      case 'subscription.created':
        await handleSubscriptionCreated(payload);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;

      case 'refund.processed':
        await handleRefundProcessed(payload);
        break;

      default:
        console.warn(`Evento desconhecido: ${payload.event}`);
    }

    // 4. Retornar sucesso para a Kirvano
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao processar webhook Kirvano:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar webhook',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Processa compra completada
 */
async function handlePurchaseCompleted(payload: KirvanoWebhookPayload) {
  const { data } = payload;

  console.log('Compra completada:', {
    transactionId: data.transactionId,
    customer: data.customerEmail,
    product: data.productName,
    amount: data.amount,
  });

  // Se houver código de indicação, processar comissão
  if (data.referralCode && data.affiliateId) {
    const result = await processReferralCommission(
      data.affiliateId,
      data.amount,
      data.transactionId
    );

    if (result.success) {
      console.log(`Comissão de R$ ${result.commission.toFixed(2)} creditada ao afiliado ${data.affiliateId}`);
    } else {
      console.error('Erro ao processar comissão:', result.error);
    }
  }

  // Aqui você pode:
  // 1. Atualizar créditos do usuário no banco de dados
  // 2. Enviar email de confirmação
  // 3. Ativar plano premium
  // 4. Registrar transação no histórico
  
  // Exemplo com Supabase (descomente e ajuste):
  /*
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from('transactions').insert({
    transaction_id: data.transactionId,
    customer_email: data.customerEmail,
    product_id: data.productId,
    amount: data.amount,
    status: 'completed',
    referral_code: data.referralCode,
    created_at: new Date().toISOString(),
  });

  // Atualizar créditos do usuário
  await supabase.rpc('add_user_credits', {
    user_email: data.customerEmail,
    credits_to_add: getCreditsForProduct(data.productId),
  });
  */
}

/**
 * Processa criação de assinatura
 */
async function handleSubscriptionCreated(payload: KirvanoWebhookPayload) {
  const { data } = payload;

  console.log('Assinatura criada:', {
    customer: data.customerEmail,
    product: data.productName,
  });

  // Aqui você pode:
  // 1. Ativar plano recorrente do usuário
  // 2. Configurar renovação automática
  // 3. Enviar email de boas-vindas
  // 4. Adicionar créditos mensais
}

/**
 * Processa cancelamento de assinatura
 */
async function handleSubscriptionCancelled(payload: KirvanoWebhookPayload) {
  const { data } = payload;

  console.log('Assinatura cancelada:', {
    customer: data.customerEmail,
    product: data.productName,
  });

  // Aqui você pode:
  // 1. Desativar renovação automática
  // 2. Manter acesso até o fim do período pago
  // 3. Enviar email de feedback
  // 4. Registrar motivo do cancelamento
}

/**
 * Processa reembolso
 */
async function handleRefundProcessed(payload: KirvanoWebhookPayload) {
  const { data } = payload;

  console.log('Reembolso processado:', {
    transactionId: data.transactionId,
    customer: data.customerEmail,
    amount: data.amount,
  });

  // Aqui você pode:
  // 1. Remover créditos do usuário
  // 2. Desativar plano premium
  // 3. Reverter comissão de afiliado (se aplicável)
  // 4. Enviar email de confirmação
}

/**
 * Helper: Mapeia produto para quantidade de créditos
 */
function getCreditsForProduct(productId: string): number {
  const creditsMap: Record<string, number> = {
    'basic-model': 30,
    'fashion-model': 100,
    'super-model': 300,
  };

  return creditsMap[productId] || 0;
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}
