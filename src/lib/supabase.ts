import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// createBrowserClient (umjesto createClient) drži sesiju i u cookiejima, ne samo
// u localStorage, tako da je middleware.ts može pročitati server-side.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper — provjeri auth i trial, redirect ako nije ok
export async function requireAuth(router: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    router.push('/auth/wall');
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, trial_ends_at')
    .eq('id', user.id)
    .single();

  const isPro = profile?.is_pro;
  const trialActive = profile?.trial_ends_at 
    ? new Date(profile.trial_ends_at) > new Date()
    : false;

  if (!isPro && !trialActive) {
    router.push('/auth/expired');
    return null;
  }

  return user;
}
