import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
