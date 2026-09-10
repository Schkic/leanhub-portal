"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Building2, CheckCircle2, XCircle } from 'lucide-react';

type State =
  | { kind: 'loading' }
  | { kind: 'need_auth' }
  | { kind: 'joined' }
  | { kind: 'error'; msg: string };

const ERROR_MSG: Record<string, string> = {
  invalid: 'Ova poveznica nije važeća.',
  used: 'Ova pozivnica je već iskorištena.',
  expired: 'Ova pozivnica je istekla. Zatražite novu od administratora.',
  already_member: 'Već ste član jedne organizacije. Jedan račun može pripadati samo jednoj organizaciji.',
  not_authenticated: 'Morate biti prijavljeni.',
};

export default function PridruziPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params?.token || '');
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ kind: 'need_auth' });
        return;
      }
      const { data, error } = await supabase.rpc('accept_org_invite', { p_token: token });
      if (error || !data?.ok) {
        setState({ kind: 'error', msg: ERROR_MSG[data?.error] || 'Greška pri pridruživanju.' });
        return;
      }
      setState({ kind: 'joined' });
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    })();
  }, [token]);

  return (
    <div className="bg-[#fafaf8] min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[440px] w-full bg-white border border-[#e2e2e2] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-[#e8f5f0] text-[#1a7a5e] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Building2 size={26} />
        </div>

        {state.kind === 'loading' && (
          <>
            <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Pridruživanje timu…</h1>
            <Loader2 className="animate-spin text-[#9a9a9a] mx-auto mt-4" size={22} />
          </>
        )}

        {state.kind === 'need_auth' && (
          <>
            <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Pozivnica za tim</h1>
            <p className="text-[#5a5a5a] mb-6">
              Prijavite se ili kreirajte račun da biste prihvatili pozivnicu.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push(`/prijava?next=${encodeURIComponent(`/pridruzi/${token}`)}`)}
                className="w-full bg-[#1a7a5e] text-white py-2.5 rounded-xl font-bold hover:bg-[#155f49] transition-all"
              >
                Prijava
              </button>
              <button
                onClick={() => router.push(`/registracija?next=${encodeURIComponent(`/pridruzi/${token}`)}`)}
                className="w-full border border-[#e2e2e2] text-[#1a1a1a] py-2.5 rounded-xl font-bold hover:bg-[#fafaf8] transition-all"
              >
                Kreiraj račun
              </button>
            </div>
          </>
        )}

        {state.kind === 'joined' && (
          <>
            <CheckCircle2 className="text-[#1a7a5e] mx-auto mb-3" size={40} />
            <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Dobrodošli u tim!</h1>
            <p className="text-[#5a5a5a]">Preusmjeravamo vas na dashboard…</p>
          </>
        )}

        {state.kind === 'error' && (
          <>
            <XCircle className="text-[#dc2626] mx-auto mb-3" size={40} />
            <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Pridruživanje nije uspjelo</h1>
            <p className="text-[#5a5a5a] mb-6">{state.msg}</p>
            <button onClick={() => router.push('/dashboard')} className="text-[#1a7a5e] font-bold hover:underline">
              Natrag na dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
