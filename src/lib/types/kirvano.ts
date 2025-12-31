/**
 * Tipos TypeScript para integração com Kirvano
 */

export interface KirvanoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  credits: number;
  features: string[];
  isRecurring: boolean;
  billingPeriod?: 'monthly' | 'yearly';
}

export interface KirvanoCustomer {
  id: string;
  email: string;
  name?: string;
  cpf?: string;
  referralCode?: string;
  affiliateId?: string;
}

export interface KirvanoTransaction {
  id: string;
  customerId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  referralCode?: string;
  affiliateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KirvanoSubscription {
  id: string;
  customerId: string;
  productId: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KirvanoReferral {
  id: string;
  userId: string;
  referralCode: string;
  referredUserId?: string;
  transactionId?: string;
  commissionAmount: number;
  commissionStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface KirvanoWebhookEvent {
  id: string;
  type: 'purchase.completed' | 'subscription.created' | 'subscription.cancelled' | 'refund.processed';
  data: Record<string, any>;
  createdAt: string;
  processed: boolean;
}

export interface KirvanoCheckoutSession {
  sessionId: string;
  productId: string;
  customerId: string;
  referralCode?: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: string;
}

export interface KirvanoCommissionSettings {
  rate: number; // Taxa de comissão (0.20 = 20%)
  minimumPayout: number; // Valor mínimo para saque
  payoutSchedule: 'weekly' | 'monthly' | 'on-demand';
  currency: string;
}

export interface KirvanoAffiliateStats {
  userId: string;
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  conversionRate: number;
  lastPayoutDate?: string;
  nextPayoutDate?: string;
}

export interface KirvanoPaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'boleto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface KirvanoRefund {
  id: string;
  transactionId: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}
