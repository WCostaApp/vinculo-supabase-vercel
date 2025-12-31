export const PLANS = {
  basic: {
    name: 'Basic Model',
    price: 29.90,
    images: 30,
    accessories: [],
    features: ['30 imagens/mês', 'Geração básica', 'Suporte por email'],
  },
  fashion: {
    name: 'Fashion Model',
    price: 69.90,
    images: 100,
    accessories: ['accessory1'],
    features: ['100 imagens/mês', 'Acessório 1 ativado', 'Geração avançada', 'Suporte prioritário'],
  },
  super: {
    name: 'Super Model',
    price: 129.90,
    images: 250,
    accessories: ['accessory1', 'accessory2', 'accessory3'],
    features: ['250 imagens/mês', 'Todos os acessórios', 'Geração premium', 'Suporte VIP'],
  },
  master: {
    name: 'Master',
    price: 0,
    images: 999999,
    accessories: ['accessory1', 'accessory2', 'accessory3'],
    features: ['Ilimitado', 'Acesso total', 'Conta de demonstração'],
  },
} as const;

export const REFERRAL_BONUS_CREDITS = 10;
export const REFERRAL_CREDITS_EXPIRY_DAYS = 7;
export const PHOTO_UPDATE_COOLDOWN_DAYS = 7;
export const REQUIRED_USER_PHOTOS = 3;

export const CLOTHING_TYPES = ['superior', 'inferior', 'conjunto'] as const;
export type ClothingType = typeof CLOTHING_TYPES[number];

export const WATERMARK_TEXT = 'Fashion.ai';

// Credenciais da conta MASTER
export const MASTER_ACCOUNT = {
  email: 'master@fashionai.com',
  password: 'fashion5483',
} as const;
