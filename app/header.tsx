'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useSidebar } from './sidebar-context'

export function Header() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const [user, setUser] = useState<User | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 glass-effect shadow-[0_32px_64px_-12px_rgba(27,27,33,0.06)] border-b border-outline-variant/20">
      <div className="px-6 py-4 flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Mobile hamburger */}
        <button
          onClick={toggle}
          className="md:hidden mr-3 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-headline font-extrabold tracking-tighter text-primary hidden md:block"
        >
          Feature Board
        </Link>

        {/* Mobile brand (centered) */}
        <Link
          href="/"
          className="text-lg font-headline font-extrabold tracking-tighter text-primary md:hidden flex-1 text-center"
        >
          Feature Board
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-on-surface-variant font-body hidden sm:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-body font-medium text-on-primary
                bg-gradient-to-r from-primary to-primary-container
                px-5 py-2.5 rounded-xl
                hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
