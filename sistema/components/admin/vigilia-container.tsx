'use client'

import { useState, useEffect } from 'react'

export function VigíliaContainer({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    } catch {}

    function onToggle(e: Event) {
      setCollapsed((e as CustomEvent<{ collapsed: boolean }>).detail.collapsed)
    }
    window.addEventListener('sidebar-toggle', onToggle)
    return () => window.removeEventListener('sidebar-toggle', onToggle)
  }, [])

  return (
    <div className={`p-4 sm:p-8 mx-auto transition-[max-width] duration-300 ease-in-out ${collapsed ? 'max-w-full' : 'max-w-6xl'}`}>
      {children}
    </div>
  )
}
