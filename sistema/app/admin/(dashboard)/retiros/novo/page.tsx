import { redirect } from 'next/navigation'
import { getSessionRole } from '@/lib/auth-guard'
import { NovoRetiroForm } from './novo-retiro-form'

export default async function NovoRetiroPage() {
  if ((await getSessionRole()) === 'secretaria_encontro') {
    redirect('/admin/retiros')
  }

  return <NovoRetiroForm />
}
