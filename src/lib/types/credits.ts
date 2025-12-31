/**
 * Tipos para sistema de créditos
 */

export interface Credit {
  id: string;
  userId: string;
  amount: number;
  source: 'purchase' | 'referral';
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

export interface CreditUsage {
  id: string;
  userId: string;
  creditsUsed: number;
  action: string;
  createdAt: string;
  remainingCredits: number;
}

export interface CreditSummary {
  totalCredits: number;
  purchaseCredits: number;
  referralCredits: number;
  expiringSoon: Credit[];
}
