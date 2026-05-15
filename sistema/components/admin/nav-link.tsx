'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface NavLinkProps {
  href: string
  label: string
  icon: ReactNode
  exact?: boolean
}

export function NavLink({ href, label, icon, exact = false }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-teal-50 text-teal-700'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      )}
    >
      <span className={cn(isActive ? 'text-teal-600' : 'text-zinc-400')}>
        {icon}
      </span>
      {label}
    </Link>
  )
}
