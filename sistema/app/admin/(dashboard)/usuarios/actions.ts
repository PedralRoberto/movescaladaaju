'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function criarUsuario(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await assertAdmin()

    const apelido = (formData.get('apelido') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()
    const role = (formData.get('role') as string)?.trim()

    if (!apelido || !email || !password || !role) {
      return { error: 'Preencha todos os campos.' }
    }
    if (password.length < 8) {
      return { error: 'A senha deve ter pelo menos 8 caracteres.' }
    }
    const rolesValidos = ['admin', 'secretaria_movimento', 'secretaria_encontro', 'secretaria_vigilia', 'coordenador_preparatoria']
    if (!rolesValidos.includes(role)) {
      return { error: 'Cargo inválido.' }
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { apelido },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Este e-mail já está cadastrado.' }
      }
      return { error: 'Erro ao criar usuário. Tente novamente.' }
    }

    revalidatePath('/admin/usuarios')
    return {}
  } catch {
    return { error: 'Acesso negado.' }
  }
}

export async function deletarUsuario(userId: string): Promise<{ error?: string }> {
  try {
    const currentUser = await assertAdmin()

    if (currentUser.id === userId) {
      return { error: 'Você não pode remover sua própria conta.' }
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) {
      return { error: 'Erro ao remover usuário.' }
    }

    revalidatePath('/admin/usuarios')
    return {}
  } catch {
    return { error: 'Acesso negado.' }
  }
}
