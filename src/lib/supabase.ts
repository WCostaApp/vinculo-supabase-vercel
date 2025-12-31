import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          cpf: string | null;
          created_at: string;
          plan_type: 'basic' | 'fashion' | 'super' | 'master';
          images_remaining: number;
          images_total: number;
          subscription_status: 'active' | 'cancelled' | 'expired';
          subscription_end_date: string | null;
          last_photo_update: string | null;
          referral_code: string;
          referred_by: string | null;
          bonus_credits: number;
          bonus_credits_expiry: string | null;
          device_id: string | null;
          language: 'pt' | 'en' | 'es';
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      user_photos: {
        Row: {
          id: string;
          user_id: string;
          photo_url: string;
          photo_number: 1 | 2 | 3;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_photos']['Row'], 'id' | 'uploaded_at'>;
        Update: Partial<Database['public']['Tables']['user_photos']['Insert']>;
      };
      generated_images: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          clothing_type: 'superior' | 'inferior' | 'conjunto';
          clothing_description: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['generated_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['generated_images']['Insert']>;
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: 'pending' | 'completed';
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>;
      };
      credits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: 'purchase' | 'referral';
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['credits']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['credits']['Insert']>;
      };
      credit_usage_history: {
        Row: {
          id: string;
          user_id: string;
          credits_used: number;
          action: string;
          remaining_credits: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['credit_usage_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['credit_usage_history']['Insert']>;
      };
    };
  };
};
