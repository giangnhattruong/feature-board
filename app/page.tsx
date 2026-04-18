import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SubmitForm } from './submit-form'
import { RequestList } from './request-list'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: votes } = user
    ? await supabase.from('votes').select('request_id').eq('user_id', user.id)
    : { data: [] }

  const totalRequests = requests?.length ?? 0
  const totalVotes = requests?.reduce((sum, r) => sum + (r.vote_count ?? 0), 0) ?? 0
  const userVotes = votes?.map(v => v.request_id) ?? []

  return (
    <>
      {/* Hero */}
      <section className="px-6 py-16 md:py-20 max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-wider
          text-on-surface-variant bg-surface-container rounded-full px-3 py-1 mb-6">
          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          Public Roadmap
        </p>
        <h1 className="text-5xl font-headline font-bold tracking-tight leading-tight text-on-surface mb-4">
          Feature Requests
        </h1>
        <p className="text-lg font-body text-on-surface-variant leading-relaxed max-w-xl">
          Vote on what gets built next. Your feedback shapes our roadmap.
        </p>
      </section>

      {/* Content */}
      <div className="px-6 pb-16 max-w-3xl mx-auto">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm font-body text-on-surface-variant mb-6">
          <span>
            <span className="font-headline font-bold text-on-surface">{totalRequests}</span> requests
          </span>
          <span className="text-outline-variant">·</span>
          <span>
            <span className="font-headline font-bold text-on-surface">{totalVotes}</span> votes cast
          </span>
        </div>

        {user && <SubmitForm />}
        <RequestList
          initialRequests={requests ?? []}
          currentUserId={user?.id ?? null}
          currentUserEmail={user?.email ?? null}
          initialUserVotes={userVotes}
        />
      </div>
    </>
  )
}
