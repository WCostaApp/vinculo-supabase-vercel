import { supabase } from './supabase';

/**
 * Gera um código de indicação aleatório de 8 dígitos alfanuméricos
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Verifica se um código de indicação já existe no banco
 */
export async function isReferralCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('referral_code')
    .eq('referral_code', code)
    .single();
  
  return !data;
}

/**
 * Gera um código de indicação único
 */
export async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!await isReferralCodeUnique(code) && attempts < maxAttempts) {
    code = generateReferralCode();
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Não foi possível gerar um código de indicação único');
  }
  
  return code;
}

/**
 * Valida se um código de indicação existe
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code || code.length !== 8) {
    return false;
  }

  const { data } = await supabase
    .from('users')
    .select('referral_code')
    .eq('referral_code', code)
    .single();
  
  return !!data;
}

/**
 * Busca informações do usuário que fez a indicação
 */
export async function getReferrerInfo(referralCode: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, referral_code')
    .eq('referral_code', referralCode)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Cria um registro de indicação pendente
 */
export async function createPendingReferral(referrerId: string, referredId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: referredId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar indicação:', error);
    return null;
  }

  return data;
}

/**
 * Completa uma indicação e adiciona créditos ao indicador
 */
export async function completeReferral(
  referredUserId: string,
  planType: 'basic' | 'fashion' | 'super'
) {
  // Créditos de bônus por plano
  const bonusCredits: Record<string, number> = {
    basic: 10,
    fashion: 25,
    super: 50,
  };

  // Buscar a indicação pendente
  const { data: referral, error: referralError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', referredUserId)
    .eq('status', 'pending')
    .single();

  if (referralError || !referral) {
    console.log('Nenhuma indicação pendente encontrada');
    return null;
  }

  // Buscar o usuário que fez a indicação
  const { data: referrer, error: referrerError } = await supabase
    .from('users')
    .select('*')
    .eq('id', referral.referrer_id)
    .single();

  if (referrerError || !referrer) {
    console.error('Usuário indicador não encontrado');
    return null;
  }

  // Calcular novos créditos
  const credits = bonusCredits[planType] || 10;
  const newBonusCredits = (referrer.bonus_credits || 0) + credits;
  
  // Data de expiração (6 meses)
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  // Atualizar créditos do indicador
  const { error: updateError } = await supabase
    .from('users')
    .update({
      bonus_credits: newBonusCredits,
      bonus_credits_expiry: expiryDate.toISOString(),
    })
    .eq('id', referrer.id);

  if (updateError) {
    console.error('Erro ao atualizar créditos:', updateError);
    return null;
  }

  // Marcar indicação como completa
  const { error: completeError } = await supabase
    .from('referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  if (completeError) {
    console.error('Erro ao completar indicação:', completeError);
    return null;
  }

  return {
    referrer,
    credits,
    newTotal: newBonusCredits,
  };
}

/**
 * Busca todas as indicações de um usuário
 */
export async function getUserReferrals(userId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:users!referrals_referred_id_fkey(email, plan_type, created_at)
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar indicações:', error);
    return [];
  }

  return data;
}

/**
 * Estatísticas de indicações de um usuário
 */
export async function getReferralStats(userId: string) {
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('status')
    .eq('referrer_id', userId);

  if (error) {
    return {
      total: 0,
      pending: 0,
      completed: 0,
    };
  }

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    completed: referrals.filter(r => r.status === 'completed').length,
  };

  return stats;
}
