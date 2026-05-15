import { createClient } from '@supabase/supabase-js'

// Client com service role — bypassa RLS, uso exclusivo em servidor.
// NUNCA importar em Client Components ou expor ao browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
