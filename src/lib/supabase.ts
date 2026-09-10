import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// createBrowserClient (umjesto createClient) drži sesiju i u cookiejima, ne samo
// u localStorage, tako da je middleware.ts može pročitati server-side.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type CurrentOrg = {
  org_id: string;
  naziv: string;
  role: 'owner' | 'admin' | 'manager' | 'auditor' | 'user' | 'viewer';
  is_pro: boolean;
  trial_ends_at: string | null;
  pro_expires_at: string | null;
  plan_interval: string | null;
  kaizen_share_token: string;
};

// Dohvati organizaciju trenutnog korisnika (preko članstva). Billing i pretplata
// od Faze 0 žive na organizaciji, ne više na profiles.
export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('memberships')
    .select(
      'role, organizations(id, naziv, is_pro, trial_ends_at, pro_expires_at, plan_interval, kaizen_share_token)'
    )
    .eq('user_id', user.id)
    .maybeSingle();

  const org = (data?.organizations ?? null) as any;
  if (!data || !org) return null;

  return {
    org_id: org.id,
    naziv: org.naziv,
    role: data.role,
    is_pro: !!org.is_pro,
    trial_ends_at: org.trial_ends_at,
    pro_expires_at: org.pro_expires_at,
    plan_interval: org.plan_interval,
    kaizen_share_token: org.kaizen_share_token,
  };
}

export function orgTrialActive(org: Pick<CurrentOrg, 'trial_ends_at'> | null): boolean {
  return org?.trial_ends_at ? new Date(org.trial_ends_at) > new Date() : false;
}

// Helper — provjeri auth i pretplatu organizacije, redirect ako nije ok
export async function requireAuth(router: any) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    router.push('/auth/wall');
    return null;
  }

  const org = await getCurrentOrg();

  // Korisnik bez organizacije — mora prvo proći onboarding (kreirati organizaciju
  // ili prihvatiti pozivnicu).
  if (!org) {
    router.push('/organizacija');
    return null;
  }

  if (!org.is_pro && !orgTrialActive(org)) {
    router.push('/auth/expired');
    return null;
  }

  return user;
}
