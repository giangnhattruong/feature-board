'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — gradient + branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-primary-container
        flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed/10 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-inverse-primary/10 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />

        <div className="relative z-10">
          {/* Icon box */}
          <div className="w-16 h-16 bg-surface-container-lowest/10 backdrop-blur-xl rounded-2xl
            flex items-center justify-center mb-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
            <span className="material-symbols-outlined text-3xl text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              layers
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-headline font-extrabold tracking-tight leading-tight text-on-primary mb-6">
            Build what<br />users want.
          </h1>
          <p className="text-on-primary-container text-lg xl:text-xl font-body font-light leading-relaxed max-w-sm">
            Collect feature requests. Prioritize by votes. Ship with confidence.
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="w-full lg:w-1/2 bg-surface-container-lowest lg:rounded-l-[2.5rem] lg:-ml-10 z-30
        shadow-[0_0_64px_-12px_rgba(27,27,33,0.08)] flex items-center justify-center
        px-8 py-12 sm:px-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-headline font-extrabold tracking-tighter text-primary">
              Feature Board
            </Link>
          </div>

          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-sm font-body text-on-surface-variant mb-8">
            {isSignUp ? 'Start collecting feedback today.' : 'Sign in to vote and submit requests.'}
          </p>

          {/* Decorative social login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-surface-container
              py-3.5 rounded-lg text-sm font-body font-medium text-on-surface
              hover:bg-surface-container-high transition-colors mb-6"
            aria-label="Continue with Google (not yet available)"
            disabled
          >
            {/* Google SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 h-px bg-surface-container-high" />
            <span className="px-4 text-xs font-body text-outline bg-surface-container-lowest">or continue with email</span>
            <div className="flex-1 h-px bg-surface-container-high" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-body font-medium text-on-surface mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline" aria-hidden="true">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-surface-container pl-11 pr-4 py-3.5 rounded-lg
                    text-sm font-body text-on-surface placeholder:text-outline
                    focus:ring-2 focus:ring-inset focus:ring-primary
                    focus:shadow-[0_8px_32px_-4px_rgba(27,27,33,0.06)] outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-body font-medium text-on-surface mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-outline" aria-hidden="true">
                  lock
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  className="w-full bg-surface-container pl-11 pr-4 py-3.5 rounded-lg
                    text-sm font-body text-on-surface placeholder:text-outline
                    focus:ring-2 focus:ring-inset focus:ring-primary
                    focus:shadow-[0_8px_32px_-4px_rgba(27,27,33,0.06)] outline-none transition-all duration-200"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-body text-on-error-container bg-error-container rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg text-sm font-body font-medium text-on-primary
                bg-gradient-to-r from-primary to-primary-container
                shadow-[0_8px_16px_-4px_rgba(51,48,147,0.2)]
                hover:shadow-[0_12px_24px_-4px_rgba(51,48,147,0.3)]
                hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? 'Loading…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-body text-on-surface-variant">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(v => !v); setError(null) }}
              className="text-primary hover:text-primary-container font-semibold transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
