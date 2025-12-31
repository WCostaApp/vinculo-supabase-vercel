/**
 * Kirvano Integration Service
 * 
 * Este arquivo gerencia toda a comunicação com a plataforma Kirvano
 * para processamento de pagamentos e sistema de indicações/afiliados.
 */

// Tipos para integração com Kirvano
export interface KirvanoConfig {
  webhookUrl: string;
  apiKey: string;
  apiSecret: string;
  environment: 'production' | 'sandbox';
}

export interface KirvanoWebhookPayload {
  event: 'purchase.completed' | 'subscription.created' | 'subscription.cancelled' | 'refund.processed';
  data: {
    transactionId: string;
    customerId: string;
    customerEmail: string;
    productId: string;
    productName: string;
    amount: number;
    currency: string;
    status: string;
    referralCode?: string; // Código de indicação usado na compra
    affiliateId?: string; // ID do afiliado que indicou
    timestamp: string;
  };
  signature: string; // Para validação de segurança
}

export interface ReferralData {
  referralCode: string;
  userId: string;
  referredUsers: string[];
  totalEarnings: number;
  pendingEarnings: number;
  conversions: number;
}

/**
 * Configuração da Kirvano
 * IMPORTANTE: Configure estas variáveis de ambiente no arquivo .env.local:
 * - NEXT_PUBLIC_KIRVANO_WEBHOOK_URL
 * - KIRVANO_API_KEY
 * - KIRVANO_API_SECRET
 * - KIRVANO_ENVIRONMENT (production ou sandbox)
 */
export const kirvanoConfig: KirvanoConfig = {
  webhookUrl: process.env.NEXT_PUBLIC_KIRVANO_WEBHOOK_URL || '',
  apiKey: process.env.KIRVANO_API_KEY || '',
  apiSecret: process.env.KIRVANO_API_SECRET || '',
  environment: (process.env.KIRVANO_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
};

/**
 * Valida se as credenciais da Kirvano estão configuradas
 */
export function isKirvanoConfigured(): boolean {
  return !!(
    kirvanoConfig.webhookUrl &&
    kirvanoConfig.apiKey &&
    kirvanoConfig.apiSecret
  );
}

/**
 * Gera um código de indicação único para o usuário
 */
export function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const userHash = userId.substring(0, 6);
  return `${userHash}-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Valida a assinatura do webhook da Kirvano
 * Isso garante que o webhook realmente veio da Kirvano
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implementação básica - ajuste conforme documentação da Kirvano
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Processa comissão de indicação
 * Calcula e registra a comissão quando uma venda é realizada através de indicação
 */
export async function processReferralCommission(
  affiliateId: string,
  transactionAmount: number,
  transactionId: string
): Promise<{ success: boolean; commission: number; error?: string }> {
  try {
    // Taxa de comissão (ajuste conforme seu modelo de negócio)
    const COMMISSION_RATE = 0.20; // 20% de comissão
    const commission = transactionAmount * COMMISSION_RATE;

    // Aqui você pode integrar com seu banco de dados para registrar a comissão
    // Exemplo: await supabase.from('referral_commissions').insert({ ... })

    console.log(`Comissão processada: R$ ${commission.toFixed(2)} para afiliado ${affiliateId}`);

    return {
      success: true,
      commission,
    };
  } catch (error) {
    console.error('Erro ao processar comissão:', error);
    return {
      success: false,
      commission: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Envia evento para a Kirvano
 * Use para notificar a Kirvano sobre eventos importantes no seu app
 */
export async function sendEventToKirvano(
  event: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!isKirvanoConfigured()) {
    console.warn('Kirvano não configurada. Configure as variáveis de ambiente.');
    return { success: false, error: 'Kirvano não configurada' };
  }

  try {
    const response = await fetch(`${kirvanoConfig.webhookUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': kirvanoConfig.apiKey,
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar evento: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar evento para Kirvano:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Cria link de checkout com código de indicação
 * Gera URL de checkout da Kirvano incluindo o código de indicação
 */
export function createCheckoutLink(
  productId: string,
  referralCode?: string
): string {
  const baseUrl = kirvanoConfig.webhookUrl.replace('/webhook', '/checkout');
  const params = new URLSearchParams({
    product: productId,
    ...(referralCode && { ref: referralCode }),
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Obtém estatísticas de indicação do usuário
 * Busca dados de performance do programa de afiliados
 */
export async function getReferralStats(userId: string): Promise<ReferralData | null> {
  try {
    // Aqui você integraria com seu banco de dados
    // Exemplo: const { data } = await supabase.from('referrals').select('*').eq('user_id', userId)
    
    // Retorno de exemplo - substitua pela sua lógica real
    return {
      referralCode: generateReferralCode(userId),
      userId,
      referredUsers: [],
      totalEarnings: 0,
      pendingEarnings: 0,
      conversions: 0,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de indicação:', error);
    return null;
  }
}
