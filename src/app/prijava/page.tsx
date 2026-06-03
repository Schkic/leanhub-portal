"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Greška pri prijavi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fafaf8] min-h-[calc(100vh-58px)] flex items-center justify-center px-6">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e8f5f0] text-[#1a7a5e] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-serif">L°</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Dobrodošli natrag</h1>
          <p className="text-[#5a5a5a]">Prijavite se u svoj Leanopedija profil</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-[#e2e2e2] rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="field">
              <label className="text-xs font-semibold text-[#5a5a5a]">Email adresa</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]" size={16} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#e2e2e2] rounded-xl text-sm focus:border-[#1a7a5e] outline-none transition-all"
                  placeholder="ime@firma.hr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="text-xs font-semibold text-[#5a5a5a]">Lozinka</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]" size={16} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#e2e2e2] rounded-xl text-sm focus:border-[#1a7a5e] outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1a7a5e] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#155f49] transition-all disabled:opacity-70 mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Prijava <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-sm text-[#5a5a5a]">
          Nemate račun? <a href="/registracija" className="text-[#1a7a5e] font-bold hover:underline">Registrirajte se besplatno</a>
        </p>
      </div>
    </div>
  );
}
