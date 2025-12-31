'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface BuyCreditsButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function BuyCreditsButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: BuyCreditsButtonProps) {
  const handleBuyCredits = () => {
    // Redireciona para a página de compra da Kirvano
    window.open('https://kirvano.com/comprar-creditos', '_blank');
  };

  return (
    <Button
      onClick={handleBuyCredits}
      variant={variant}
      size={size}
      className={className}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Comprar Créditos
    </Button>
  );
}
