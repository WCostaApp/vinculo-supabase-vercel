'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002f5c] to-[#004080]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg">Carregando Fashion.ai...</p>
      </div>
    </div>
  );
}
