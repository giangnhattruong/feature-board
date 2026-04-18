'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Request {
  id: string
  title: string
  description: string | null
  created_by: string | null
  created_at: string
  vote_count: number
}

interface Props {
  initialRequests: Request[]
  currentUserId: string | null
  currentUserEmail: string | null
  initialUserVotes: string[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function RequestList({ initialRequests, currentUserId, currentUserEmail, initialUserVotes }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [userVotes, setUserVotes] = useState(new Set(initialUserVotes))
  const [votingId, setVotingId] = useState<string | null>(null)
  const [voteError, setVoteError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function toggleVote(requestId: string) {
    if (!currentUserId || votingId) return
    setVotingId(requestId)
    setVoteError(null)

    const voted = userVotes.has(requestId)
    // Optimistic update
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, vote_count: r.vote_count + (voted ? -1 : 1) } : r
    ))
    setUserVotes(prev => {
      const next = new Set(prev)
      if (voted) {
        next.delete(requestId)
      } else {
        next.add(requestId)
      }
      return next
    })

    const { error } = voted
      ? await supabase.from('votes').delete().eq('request_id', requestId).eq('user_id', currentUserId)
      : await supabase.from('votes').insert({ request_id: requestId, user_id: currentUserId })

    if (error) {
      // Rollback
      setRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, vote_count: r.vote_count + (voted ? 1 : -1) } : r
      ))
      setUserVotes(prev => {
        const next = new Set(prev)
        if (voted) {
          next.add(requestId)
        } else {
          next.delete(requestId)
        }
        return next
      })
      setVoteError('Failed to register vote. Please try again.')
    } else {
      router.refresh()
    }
    setVotingId(null)
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-fixed mb-6">
          <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
        </div>
        <h3 className="text-xl font-headline font-bold text-on-surface mb-2">No feature requests yet</h3>
        <p className="text-sm font-body text-on-surface-variant">
          {currentUserId ? 'Be the first — submit a request above.' : 'Sign in to submit the first request.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {voteError && (
        <p className="text-sm font-body text-on-error-container bg-error-container rounded-xl px-4 py-3">
          {voteError}
        </p>
      )}

      {requests.map(request => {
        const voted = userVotes.has(request.id)
        const isOwner = currentUserId && request.created_by === currentUserId
        const isVoting = votingId === request.id

        return (
          <article
            key={request.id}
            className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow ambient-shadow-hover transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Upvote box */}
              <div className="flex-shrink-0">
                {currentUserId ? (
                  <button
                    onClick={() => toggleVote(request.id)}
                    disabled={isVoting}
                    aria-label={voted ? `Remove vote from ${request.title}` : `Vote for ${request.title}`}
                    className={`flex flex-col items-center justify-center min-w-[80px] p-4 rounded-xl
                      border transition-all duration-200 gap-1
                      ${voted
                        ? 'bg-primary text-on-primary border-primary shadow-[0_8px_16px_-4px_rgba(51,48,147,0.3)]'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:text-primary hover:bg-primary-fixed hover:border-primary/20'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      keyboard_arrow_up
                    </span>
                    <span className="font-headline font-bold text-xl">{request.vote_count}</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center min-w-[80px] p-4 rounded-xl
                    bg-surface-container-low text-outline border border-outline-variant/20 gap-1 cursor-default"
                    aria-label={`${request.vote_count} votes`}
                  >
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">keyboard_arrow_up</span>
                    <span className="font-headline font-bold text-xl">{request.vote_count}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="rounded-full px-3 py-1 text-xs font-body font-semibold uppercase tracking-wider
                    bg-secondary-container text-on-secondary-container">
                    Planned
                  </span>
                </div>
                <Link href={`/requests/${request.id}`}>
                  <h3 className="text-2xl font-headline font-bold tracking-tight text-on-surface mb-2 hover:text-primary transition-colors">
                    {request.title}
                  </h3>
                </Link>
                {request.description && (
                  <p className="font-body text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                    {request.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs font-body text-outline">
                  <span>{timeAgo(request.created_at)}</span>
                  {isOwner && (
                    <>
                      <span className="text-outline-variant">·</span>
                      <span>{currentUserEmail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
