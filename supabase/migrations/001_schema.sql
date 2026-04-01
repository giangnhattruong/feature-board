-- ============================================
-- Feature Request Board Schema
-- ============================================

-- Requests table
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  vote_count int default 0
);

-- Votes table
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  unique (request_id, user_id)
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.requests enable row level security;
alter table public.votes enable row level security;

-- Anyone can read requests
create policy "Anyone can read requests"
  on public.requests for select
  using (true);

-- Authenticated users can insert requests (created_by must be their own uid)
create policy "Authenticated users can insert requests"
  on public.requests for insert
  to authenticated
  with check (created_by = auth.uid());

-- Users can update only their own requests (restricted to no columns changing created_by)
create policy "Users can delete their own requests"
  on public.requests for delete
  to authenticated
  using (created_by = auth.uid());

-- Anyone can read votes
create policy "Anyone can read votes"
  on public.votes for select
  using (true);

-- Authenticated users can insert their own votes
create policy "Authenticated users can insert votes"
  on public.votes for insert
  to authenticated
  with check (user_id = auth.uid());

-- Authenticated users can delete their own votes
create policy "Authenticated users can delete their own votes"
  on public.votes for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================
-- Vote count trigger
-- ============================================

create or replace function public.update_vote_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.requests
      set vote_count = vote_count + 1
      where id = new.request_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.requests
      set vote_count = vote_count - 1
      where id = old.request_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row
  execute function public.update_vote_count();

-- ============================================
-- Indexes
-- ============================================

create index idx_requests_vote_count on public.requests (vote_count desc, created_at desc);
create index idx_votes_request_id on public.votes (request_id);
create index idx_votes_user_id on public.votes (user_id);
