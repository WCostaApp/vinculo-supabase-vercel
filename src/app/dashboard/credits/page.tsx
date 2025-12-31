'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Gift, 
  Calendar, 
  History, 
  AlertCircle,
  XCircle,
  ArrowLeft,
  Database
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CreditsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Dados mockados para demonstração
  const creditsSummary = {
    total: 150,
    purchase: 100,
    referral: 50,
  };

  const mockCredits = [
    {
      id: '1',
      amount: 100,
      source: 'purchase' as const,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      amount: 50,
      source: 'referral' as const,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  const mockUsageHistory = [
    {
      id: '1',
      action: 'Geração de imagem',
      credits_used: 10,
      remaining_credits: 140,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      action: 'Geração de imagem',
      credits_used: 10,
      remaining_credits: 150,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header com botão de voltar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Painel de Créditos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie seus créditos e acompanhe seu histórico de uso
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/generate')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Sair do Painel
          </Button>
        </div>

        {/* Alerta informativo */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-blue-800 dark:text-blue-200">
              Exibindo dados de demonstração. Configure as tabelas do banco de dados para ver seus créditos reais.
            </p>
          </div>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total de Créditos */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total de Créditos
                </p>
                <p className="text-4xl font-bold mt-2">{creditsSummary.total}</p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          {/* Créditos de Compra */}
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Créditos de Compra
                </p>
                <p className="text-4xl font-bold mt-2">
                  {creditsSummary.purchase}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          {/* Créditos de Indicação */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Créditos de Indicação
                </p>
                <p className="text-4xl font-bold mt-2">
                  {creditsSummary.referral}
                </p>
              </div>
              <Gift className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Detalhes dos Créditos */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detalhes dos Créditos
            </h2>
          </div>

          <div className="space-y-4">
            {mockCredits.map((credit) => {
              const isExpired = new Date(credit.expires_at) < new Date();
              const expiringSoon = isExpiringSoon(credit.expires_at);

              return (
                <div
                  key={credit.id}
                  className={`p-4 rounded-lg border ${
                    isExpired
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
                      : expiringSoon
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {credit.source === 'purchase' ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {credit.amount} créditos
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {credit.source === 'purchase'
                            ? 'Compra'
                            : 'Indicação'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expira em
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isExpired
                            ? 'text-gray-500'
                            : expiringSoon
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {formatDate(credit.expires_at)}
                      </p>
                      {expiringSoon && !isExpired && (
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs">Expira em breve</span>
                        </div>
                      )}
                      {isExpired && (
                        <span className="text-xs text-gray-500">
                          Expirado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Histórico de Uso */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Histórico de Uso
            </h2>
          </div>

          <div className="space-y-3">
            {mockUsageHistory.map((usage) => (
              <div
                key={usage.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {usage.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(usage.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{usage.credits_used}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Restante: {usage.remaining_credits}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Botão Cancelar Assinatura */}
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Cancelar Assinatura
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Precisa cancelar seu plano? Saiba como proceder.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              className="whitespace-nowrap"
            >
              Cancelar Assinatura
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialog de Cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Cancelamento de Assinatura
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Para cancelar sua assinatura, você deve acessar a plataforma
                onde realizou a compra.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Plataforma Kirvano
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Acesse sua conta na Kirvano e gerencie suas assinaturas
                  diretamente por lá. O cancelamento será processado conforme
                  os termos da plataforma.
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Após o cancelamento, você continuará tendo acesso aos recursos
                até o final do período já pago.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                window.open('https://kirvano.com', '_blank');
                setShowCancelDialog(false);
              }}
            >
              Ir para Kirvano
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
