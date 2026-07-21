"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, CreditCard, Shield } from 'lucide-react';

// TODO: uskladi s tvojim stvarnim godišnjim Price-om u Stripeu
const ANNUAL_PRICE_LABEL = '€299,99';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }
      setUser(user);
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      setLoading(false);
    };
    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email, plan: selectedPlan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleManageSubscription = async () => {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: profile.stripe_customer_id }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || 'Nešto je pošlo po zlu, pokušajte ponovno.');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a7a5e]"></div>
    </div>
  );

  const isPro = profile?.is_pro;
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      <div className="max-w-[700px] mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Moj profil</h1>
        <p className="text-[#5a5a5a] mb-10">Upravljajte svojim računom i pretplatom.</p>

        {/* Podaci o računu */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#e8f5f0] text-[#1a7a5e] rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="font-bold text-[#1a1a1a]">Podaci o računu</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
              <span className="text-sm text-[#5a5a5a]">Ime i prezime</span>
              <span className="text-sm font-semibold">{user?.user_metadata?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#5a5a5a]">Email adresa</span>
              <span className="text-sm font-semibold">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Plan i pretplata */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#e8f5f0] text-[#1a7a5e] rounded-full flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h2 className="font-bold text-[#1a1a1a]">Pretplata</h2>
          </div>

          {isPro ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-sm text-[#5a5a5a]">Trenutni plan</span>
                <span className="text-sm font-bold text-[#1a7a5e]">PRO ✨</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-sm text-[#5a5a5a]">Cijena</span>
                <span className="text-sm font-semibold">
                  {profile?.plan_interval === 'annual' ? `${ANNUAL_PRICE_LABEL} / godina` : '€29,99 / mjesec'}
                </span>
              </div>
              <button onClick={handleManageSubscription} className="w-full py-3 bg-white border border-[#e2e2e2] text-[#1a1a1a] font-bold rounded-xl hover:bg-[#fafaf8] transition-all">
                Upravljaj pretplatom →
              </button>
              <p className="text-xs text-[#9a9a9a] text-center">
                Promijenite plan (mjesečno/godišnje), ažurirajte karticu ili otkažite pretplatu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-sm text-[#5a5a5a]">Trenutni plan</span>
                <span className="text-sm font-bold text-[#9a9a9a]">
                  Probni period{trialDaysLeft !== null && ` — još ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dan' : 'dana'}`}
                </span>
              </div>
              <p className="text-sm text-[#5a5a5a] leading-relaxed">
                {trialDaysLeft !== null
                  ? <>Preostalo vam je <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'dan' : 'dana'}</strong> probnog perioda. Otkažite kad god želite.</>
                  : <>Isprobajte sve PRO funkcije <strong>besplatno 14 dana</strong>. Otkažite kad god želite.</>
                }
              </p>

              <div className="flex gap-2 p-1 bg-[#fafaf8] border border-[#e2e2e2] rounded-xl">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPlan === 'monthly' ? 'bg-white shadow text-[#1a7a5e]' : 'text-[#5a5a5a]'}`}
                >
                  Mjesečno<br /><span className="text-xs font-normal">€29,99/mj</span>
                </button>
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPlan === 'annual' ? 'bg-white shadow text-[#1a7a5e]' : 'text-[#5a5a5a]'}`}
                >
                  Godišnje<br /><span className="text-xs font-normal">{ANNUAL_PRICE_LABEL}/god</span>
                </button>
              </div>

              <button onClick={handleUpgrade} className="w-full py-3 bg-[#1a7a5e] text-white font-bold rounded-xl hover:bg-[#155f49] transition-all">
                Aktiviraj PRO — 14 dana besplatno →
              </button>
            </div>
          )}
        </div>

        {/* Sigurnost */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#e8f5f0] text-[#1a7a5e] rounded-full flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h2 className="font-bold text-[#1a1a1a]">Sigurnost</h2>
          </div>
          <p className="text-sm text-[#5a5a5a] mb-4">Za promjenu lozinke kontaktirajte nas na <a href="mailto:info@opticora.hr" className="text-[#1a7a5e] font-semibold">info@opticora.hr</a>.</p>
        </div>

        {/* Odjava */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all">
          <LogOut size={18} /> Odjava
        </button>
      </div>
    </div>
  );
}
