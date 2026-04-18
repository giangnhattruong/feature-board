'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function SubmitForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in.'); setLoading(false); return }

    const { error: insertError } = await supabase
      .from('requests')
      .insert({ title: title.trim(), description: description.trim() || null, created_by: user.id })

    if (insertError) {
      setError(insertError.message)
    } else {
      setTitle('')
      setDescription('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-surface-container-low rounded-xl ring-1 ring-outline-variant/15 p-6 sm:p-10 mb-8">
      <h2 className="text-2xl font-headline font-bold text-on-surface mb-1">Submit a request</h2>
      <p className="text-sm font-body text-on-surface-variant mb-8">
        Describe the feature you&apos;d like to see built.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title field */}
        <div>
          <label htmlFor="req-title" className="block text-sm font-body font-medium text-on-surface mb-2">
            Title <span className="text-error">*</span>
          </label>
          <input
            id="req-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Dark mode support"
            required
            className="w-full bg-surface-container-lowest rounded-lg ring-1 ring-outline-variant/20
              py-3.5 px-4 text-sm font-body text-on-surface placeholder:text-outline
              focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-surface-bright
              focus:shadow-[0_16px_32px_-8px_rgba(27,27,33,0.06)] outline-none transition-all duration-200"
          />
        </div>

        {/* Description field with decorative toolbar */}
        <div>
          <label htmlFor="req-desc" className="block text-sm font-body font-medium text-on-surface mb-2">
            Description
          </label>
          <div className="bg-surface-container-lowest rounded-lg ring-1 ring-outline-variant/20
            focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-bright
            focus-within:shadow-[0_16px_32px_-8px_rgba(27,27,33,0.06)] transition-all duration-200">
            {/* Decorative toolbar */}
            <div className="flex items-center gap-1 border-b border-outline-variant/20 bg-surface px-3 py-2 rounded-t-lg">
              {[
                { icon: 'format_bold', label: 'Bold' },
                { icon: 'format_italic', label: 'Italic' },
                { icon: 'link', label: 'Link' },
                { icon: 'format_list_bulleted', label: 'Bulleted list' },
              ].map(({ icon, label }) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={label}
                  tabIndex={-1}
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">{icon}</span>
                </button>
              ))}
              <div className="w-px h-5 bg-outline-variant/30 mx-1" aria-hidden="true" />
            </div>
            <textarea
              id="req-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the feature in detail..."
              className="w-full bg-transparent px-4 py-3.5 text-sm font-body text-on-surface
                placeholder:text-outline resize-none outline-none rounded-b-lg"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-body text-on-error-container bg-error-container rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="border-t border-outline-variant/15 pt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => { setTitle(''); setDescription(''); setError(null) }}
            className="px-5 py-2.5 text-sm font-body text-on-surface-variant rounded-lg
              hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-body font-medium text-on-primary
              bg-gradient-to-r from-primary to-primary-container rounded-xl
              hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">send</span>
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>

      <p className="text-xs font-body text-outline mt-8 text-center">
        All requests are public and visible to other users.
      </p>
    </div>
  )
}
