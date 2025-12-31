'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Sparkles, FileText, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error(t.termsNotAccepted);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, cpf);
      toast.success('Conta criada com sucesso!');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002f5c] via-[#003d6b] to-[#004080] p-4">
      <div className="absolute top-4 right-4">
        <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
          <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#002f5c] to-[#004080] rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#002f5c] to-[#004080] bg-clip-text text-transparent">
            Fashion.ai
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {t.register}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-[#002f5c] focus:ring-[#002f5c]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">{t.cpf} (opcional)</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="border-gray-300 focus:border-[#002f5c] focus:ring-[#002f5c]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-[#002f5c] focus:ring-[#002f5c]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-[#002f5c] focus:ring-[#002f5c]"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1 border-[#002f5c] data-[state=checked]:bg-[#002f5c]"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-gray-800 font-medium">
                    {t.termsAccept}
                  </Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="w-full text-[#002f5c] border-[#002f5c] hover:bg-[#002f5c] hover:text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {t.viewTerms}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-[#002f5c] flex items-center gap-2">
                          <FileText className="w-6 h-6" />
                          {t.termsTitle}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                          {t.termsIntro}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 text-sm text-gray-700 py-4">
                        {/* Termo 1 - Uso de IA */}
                        <div className="border-l-4 border-[#002f5c] pl-4 py-2">
                          <h3 className="font-bold text-[#002f5c] mb-2 text-base">{t.term1Title}</h3>
                          <p className="leading-relaxed">{t.term1}</p>
                        </div>

                        {/* Termo 2 - Responsabilidade do Usuário */}
                        <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
                          <h3 className="font-bold text-red-700 mb-2 text-base flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {t.term2Title}
                          </h3>
                          <p className="leading-relaxed text-red-900">{t.term2}</p>
                        </div>

                        {/* Termo 3 - Cancelamento */}
                        <div className="border-l-4 border-[#002f5c] pl-4 py-2">
                          <h3 className="font-bold text-[#002f5c] mb-2 text-base">{t.term3Title}</h3>
                          <p className="leading-relaxed">{t.term3}</p>
                        </div>

                        {/* Termo 4 - APIs de Terceiros */}
                        <div className="border-l-4 border-[#002f5c] pl-4 py-2">
                          <h3 className="font-bold text-[#002f5c] mb-2 text-base">{t.term4Title}</h3>
                          <p className="leading-relaxed">{t.term4}</p>
                        </div>

                        {/* Termo 5 - Privacidade */}
                        <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                          <h3 className="font-bold text-green-700 mb-2 text-base">{t.term5Title}</h3>
                          <p className="leading-relaxed text-green-900">{t.term5}</p>
                        </div>

                        {/* Termo 6 - Aceitação */}
                        <div className="border-l-4 border-[#002f5c] pl-4 py-2">
                          <h3 className="font-bold text-[#002f5c] mb-2 text-base">{t.term6Title}</h3>
                          <p className="leading-relaxed">{t.term6}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs text-gray-500 text-center">
                          Fashion.ai © 2024 - Todos os direitos reservados
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#002f5c] to-[#004080] hover:from-[#003d6b] hover:to-[#005099] text-white font-semibold py-6 transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading || !acceptedTerms}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.register}...
                </>
              ) : (
                t.register
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-gray-600 text-center">
              {t.alreadyHaveAccount}{' '}
              <Link href="/auth/login" className="text-[#002f5c] hover:text-[#004080] font-semibold hover:underline">
                {t.login}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
