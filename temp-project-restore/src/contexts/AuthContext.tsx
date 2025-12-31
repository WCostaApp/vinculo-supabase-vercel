'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { MASTER_ACCOUNT } from '@/lib/constants';

interface UserProfile {
  id: string;
  email: string;
  cpf: string | null;
  plan_type: 'basic' | 'fashion' | 'super' | 'master';
  images_remaining: number;
  images_total: number;
  subscription_status: 'active' | 'cancelled' | 'expired';
  referral_code: string;
  bonus_credits: number;
  language: 'pt' | 'en' | 'es';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, cpf?: string, referredBy?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// UUID válido para conta MASTER
const MASTER_UUID = '00000000-0000-0000-0000-000000000000';

// Mock user para conta MASTER
const MASTER_USER: User = {
  id: MASTER_UUID,
  email: MASTER_ACCOUNT.email,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const MASTER_PROFILE: UserProfile = {
  id: MASTER_UUID,
  email: MASTER_ACCOUNT.email,
  cpf: null,
  plan_type: 'master',
  images_remaining: 999999,
  images_total: 999999,
  subscription_status: 'active',
  referral_code: 'MASTER',
  bonus_credits: 0,
  language: 'pt',
};

// Função para gerar código de indicação de 8 dígitos alfanuméricos
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Função para verificar se o código já existe
async function isReferralCodeUnique(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('referral_code')
    .eq('referral_code', code)
    .single();
  
  return !data; // Retorna true se não encontrou nenhum usuário com esse código
}

// Função para gerar código único
async function generateUniqueReferralCode(): Promise<string> {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  useEffect(() => {
    // Verificar se há sessão MASTER no localStorage
    const masterSession = localStorage.getItem('master_session');
    if (masterSession === 'active') {
      setUser(MASTER_USER);
      setProfile(MASTER_PROFILE);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Verificar se é a conta MASTER
    if (email === MASTER_ACCOUNT.email && password === MASTER_ACCOUNT.password) {
      localStorage.setItem('master_session', 'active');
      setUser(MASTER_USER);
      setProfile(MASTER_PROFILE);
      return;
    }

    // Login normal via Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, cpf?: string, referredBy?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      // Gerar código de indicação único de 8 dígitos
      const referralCode = await generateUniqueReferralCode();
      
      // Criar perfil do usuário
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        cpf: cpf || null,
        plan_type: 'basic',
        images_remaining: 30,
        images_total: 30,
        subscription_status: 'active',
        referral_code: referralCode,
        referred_by: referredBy || null,
        bonus_credits: 0,
        language: 'pt',
      });

      if (insertError) throw insertError;

      // Se foi indicado por alguém, criar registro de indicação com status 'pending'
      if (referredBy) {
        // Buscar o usuário que fez a indicação
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referredBy)
          .single();

        if (referrer) {
          await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referred_id: data.user.id,
            status: 'pending',
          });
        }
      }
    }
  };

  const signOut = async () => {
    // Verificar se é sessão MASTER
    const masterSession = localStorage.getItem('master_session');
    if (masterSession === 'active') {
      localStorage.removeItem('master_session');
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      // Se for MASTER, não precisa atualizar
      if (user.id === MASTER_UUID) {
        return;
      }
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
