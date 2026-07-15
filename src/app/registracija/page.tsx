"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

const inputClass = "w-full pl-10 pr-10 py-2.5 border border-[#e2e2e2] rounded-xl text-sm focus:border-[#1a7a5e] outline-none transition-all [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#fafaf8] min-h-[calc(100vh-58px)] flex items-center justify-center px-6">
        <div className="max-w-[450px] w-full text-center bg-white border border-[#e2e2e2] rounded-2xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📧</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-4">Provjerite svoj email</h1>
          <p className="text-[#5a5a5a] mb-8 leading-relaxed">
            Poslali smo vam poveznicu za potvrdu registracije na <strong>{email}</strong>. Kliknite na nju kako biste aktivirali svoj račun.
          </p>
          <button onClick={() => router.push('/prijava')} className="text-[#1a7a5e] font-bold hover:underline">Povratak na prijavu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf8] min-h-[calc(100vh-58px)] flex items-center justify-center px-6">
      <div className="max-w-[400px] w-full py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e8f5f0] text-[#1a7a5e] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-serif">L°</div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Kreirajte račun</h1>
          <p className="text-[#5a5a5a]">Započnite besplatno upravljanje Lean procesima</p>
        </div>
        <form onSubmit={handleRegister} className="bg-white border border-[#e2e2e2] rounded-2xl p-8 shadow-sm">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#5a5a5a] block mb-1">Ime i prezime</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none z-10" size={16} />
                <input type="text" required className={inputClass} placeholder="Marko Marković" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5a5a5a] block mb-1">Email adresa</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none z-10" size={16} />
                <input type="email" required className={inputClass} placeholder="ime@firma.hr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5a5a5a] block mb-1">Lozinka</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none z-10" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Najmanje 6 znakova"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#1a7a5e] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5a5a5a] block mb-1">Potvrdi lozinku</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] pointer-events-none z-10" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={`${inputClass} ${confirmPassword && password !== confirmPassword ? 'border-red-300' : confirmPassword && password === confirmPassword ? 'border-green-400' : ''}`}
                  placeholder="Ponovite lozinku"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#1a7a5e] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Lozinke se ne podudaraju</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">✓ Lozinke se podudaraju</p>
              )}
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#1a7a5e] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#155f49] transition-all disabled:opacity-70 mt-6">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Registracija <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
        <p className="text-center mt-8 text-sm text-[#5a5a5a]">
          Već imate račun? <a href="/prijava" className="text-[#1a7a5e] font-bold hover:underline">Prijavite se</a>
        </p>
      </div>
    </div>
  );
}
