import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!request) notFound()

  return (
    <div className="flex-1 px-4 sm:px-8 py-8 md:py-12 max-w-screen-xl mx-auto w-full">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary
          hover:text-primary-container transition-colors mb-8"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
        All requests
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full px-3 py-1 text-xs font-body font-semibold uppercase tracking-wider
              bg-secondary-container text-on-secondary-container">
              Planned
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-headline font-extrabold leading-tight text-on-surface mb-4">
            {request.title}
          </h1>

          {request.description && (
            <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-3xl">
              {request.description}
            </p>
          )}
        </div>

        {/* Sidebar metadata */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Voting box */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow ghost-border">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">
                keyboard_arrow_up
              </span>
              <span className="font-headline font-extrabold text-5xl text-on-surface">
                {request.vote_count}
              </span>
              <p className="text-sm font-body text-on-surface-variant">votes</p>
              <Link
                href="/"
                className="w-full py-3 mt-2 flex items-center justify-center gap-2 rounded-xl
                  bg-surface-container-highest text-primary text-sm font-body font-medium
                  hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">thumb_up</span>
                Go vote
              </Link>
            </div>
          </div>

          {/* Metadata card */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline font-bold text-lg text-on-surface border-b border-outline-variant/20 pb-3 mb-4">
              Details
            </h3>
            <div className="flex flex-col gap-4 text-sm font-body">
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant flex-shrink-0">Submitted</span>
                <span className="text-on-surface text-right">{timeAgo(request.created_at)}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant flex-shrink-0">Category</span>
                <span className="bg-surface-container-highest text-on-surface rounded px-2 py-1 text-xs">
                  Feature
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
