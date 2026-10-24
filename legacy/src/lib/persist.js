import { supabase } from './supabase';

export async function loadAppSnapshot(userId) {
  if (!supabase || !userId) return { snapshot: null, error: new Error('Supabase session is missing.') };
  const { data, error } = await supabase
    .from('user_app_data')
    .select('snapshot')
    .eq('user_id', userId)
    .maybeSingle();
  return { snapshot: data?.snapshot ?? null, error };
}

export async function saveAppSnapshot(userId, snapshot) {
  if (!supabase || !userId) return { error: new Error('Supabase session is missing.') };
  const { error } = await supabase.from('user_app_data').upsert({
    user_id: userId,
    snapshot,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return { error };
}
