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

  return (
    <>
      <Header user={user} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
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
