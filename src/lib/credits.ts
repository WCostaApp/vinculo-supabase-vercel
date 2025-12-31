import { supabase } from './supabase';

/**
 * Adiciona créditos para um usuário
 */
export async function addCredits(
  userId: string,
  amount: number,
  source: 'purchase' | 'referral',
  expiresInDays: number = 365
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('credits')
    .insert({
      user_id: userId,
      amount,
      source,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar créditos:', error);
    throw error;
  }

  return data;
}

/**
 * Obtém o total de créditos disponíveis de um usuário
 */
export async function getAvailableCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Erro ao buscar créditos:', error);
    return 0;
  }

  return data.reduce((sum, credit) => sum + credit.amount, 0);
}

/**
 * Obtém créditos separados por fonte (compra vs indicação)
 */
export async function getCreditsBySource(userId: string) {
  const { data, error } = await supabase
    .from('credits')
    .select('amount, source')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Erro ao buscar créditos por fonte:', error);
    return { purchase: 0, referral: 0 };
  }

  const purchase = data
    .filter((c) => c.source === 'purchase')
    .reduce((sum, c) => sum + c.amount, 0);

  const referral = data
    .filter((c) => c.source === 'referral')
    .reduce((sum, c) => sum + c.amount, 0);

  return { purchase, referral };
}

/**
 * Usa créditos e registra no histórico
 */
export async function useCredits(
  userId: string,
  amount: number,
  action: string
): Promise<boolean> {
  try {
    // Verificar créditos disponíveis
    const available = await getAvailableCredits(userId);

    if (available < amount) {
      console.error('Créditos insuficientes');
      return false;
    }

    // Registrar uso no histórico
    const remaining = available - amount;

    const { error } = await supabase
      .from('credit_usage_history')
      .insert({
        user_id: userId,
        credits_used: amount,
        action,
        remaining_credits: remaining,
      });

    if (error) {
      console.error('Erro ao registrar uso de créditos:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao usar créditos:', error);
    return false;
  }
}

/**
 * Obtém histórico de uso de créditos
 */
export async function getCreditUsageHistory(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('credit_usage_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }

  return data;
}

/**
 * Obtém créditos que expiram em breve (próximos 7 dias)
 */
export async function getExpiringSoonCredits(userId: string) {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', now.toISOString())
    .lt('expires_at', sevenDaysFromNow.toISOString())
    .order('expires_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar créditos expirando:', error);
    return [];
  }

  return data;
}
