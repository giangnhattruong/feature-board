'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Feature Board' },
]

export function Sidebar() {
  const { open, close } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-on-surface/20 z-30 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-40 flex flex-col gap-2 p-6
          bg-surface-container-low transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              layers
            </span>
          </div>
          <div>
            <p className="font-headline font-extrabold text-sm text-on-surface tracking-tight">Feature Board</p>
            <p className="text-xs text-on-surface-variant">MVP Demo</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium
                  transition-all duration-200
                  ${active
                    ? 'bg-surface-container-lowest text-primary ambient-shadow'
                    : 'text-on-surface-variant hover:bg-surface-container-lowest/50 hover:translate-x-1 hover:text-on-surface'
                  }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden="true"
                >
                  {icon}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade CTA */}
        <button
          className="w-full px-4 py-3 rounded-xl text-sm font-headline font-bold text-on-primary
            bg-gradient-to-r from-primary to-primary-container
            hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Upgrade Plan
        </button>
      </aside>
    </>
  )
}
