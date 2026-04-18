'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  requestId: string
  initialVoteCount: number
  initialVoted: boolean
  currentUserId: string | null
}

export function VoteButton({ requestId, initialVoteCount, initialVoted, currentUserId }: Props) {
  const router = useRouter()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [voted, setVoted] = useState(initialVoted)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function toggleVote() {
    if (!currentUserId || isVoting) return
    setIsVoting(true)
    setError(null)

    const wasVoted = voted
    // Optimistic update
    setVoted(!wasVoted)
    setVoteCount(prev => prev + (wasVoted ? -1 : 1))

    const { error: dbError } = wasVoted
      ? await supabase.from('votes').delete().eq('request_id', requestId).eq('user_id', currentUserId)
      : await supabase.from('votes').insert({ request_id: requestId, user_id: currentUserId })

    if (dbError) {
      // Rollback
      setVoted(wasVoted)
      setVoteCount(prev => prev + (wasVoted ? 1 : -1))
      setError('Failed to register vote. Please try again.')
    } else {
      router.refresh()
    }
    setIsVoting(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">
        keyboard_arrow_up
      </span>
      <span className="font-headline font-extrabold text-5xl text-on-surface">
        {voteCount}
      </span>
      <p className="text-sm font-body text-on-surface-variant">votes</p>

      {currentUserId === null ? (
        <Link
          href="/login"
          className="w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl
            bg-surface-container-highest text-primary text-sm font-body font-medium
            hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">thumb_up</span>
          Sign in to vote
        </Link>
      ) : (
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={toggleVote}
            disabled={isVoting}
            aria-label={voted ? 'Unvote' : 'Vote'}
            className={`w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl
              text-sm font-body font-medium transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-primary
              ${voted
                ? 'bg-primary text-on-primary hover:bg-primary/90'
                : 'bg-surface-container-highest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed'
              }`}
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
              style={voted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              thumb_up
            </span>
            {voted ? 'Unvote' : 'Vote'}
          </button>
          {error && (
            <p className="text-xs font-body text-on-error-container bg-error-container rounded px-2 py-1">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
