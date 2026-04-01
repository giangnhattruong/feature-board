import { createClient } from "@/lib/supabase/server";
import { Header } from "./header";
import { SubmitForm } from "./submit-form";
import { RequestList } from "./request-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false });

  let userVotes: string[] = [];
  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("request_id")
      .eq("user_id", user.id);
    userVotes = (votes ?? []).map((v) => v.request_id);
  }

  const totalRequests = requests?.length ?? 0;
  const totalVotes =
    requests?.reduce((sum, r) => sum + r.vote_count, 0) ?? 0;

  return (
    <>
      <Header user={user} />
      <section
        className="w-full border-b border-border"
        style={{
          background:
            "linear-gradient(to bottom, var(--accent-light), var(--background))",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">Feature Requests</h1>
          <p className="text-muted mt-2">Vote on what gets built next</p>
        </div>
      </section>
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-sm text-muted mb-6">
          <span className="font-medium text-foreground">{totalRequests}</span>{" "}
          requests ·{" "}
          <span className="font-medium text-foreground">{totalVotes}</span>{" "}
          votes cast
        </div>
        {user && <SubmitForm />}
        <RequestList
          initialRequests={requests ?? []}
          currentUserId={user?.id ?? null}
          currentUserEmail={user?.email ?? null}
          initialUserVotes={userVotes}
        />
      </main>
    </>
  );
}
