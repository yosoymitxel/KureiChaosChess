import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://fxjhuodttsbcyncpkcxb.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LWVoByppthU1ihW1LvqdNA_CfSA2chx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'kurei-chaos-chess.auth',
  },
});

export async function getEmailSignupConfig() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(SUPABASE_URL + '/auth/v1/settings', {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('No se pudo consultar la configuración pública de Auth.');
    const config = await response.json();
    return {
      autoConfirm: config.mailer_autoconfirm === true,
      signupEnabled: config.disable_signup !== true,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
