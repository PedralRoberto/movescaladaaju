import { createClient } from '@/lib/supabase/server'

export async function getSessionRole(): Promise<string | undefined> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.app_metadata?.role as string | undefined
}

export async function assertNaoEncontro(): Promise<{ error?: string }> {
  const role = await getSessionRole()
  if (role === 'secretaria_encontro') return { error: 'Sem permissão.' }
  return {}
}
