"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Request {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  vote_count: number;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function RequestList({
  initialRequests,
  currentUserId,
  currentUserEmail,
  initialUserVotes,
}: {
  initialRequests: Request[];
  currentUserId: string | null;
  currentUserEmail: string | null;
  initialUserVotes: string[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [userVotes, setUserVotes] = useState<Set<string>>(
    new Set(initialUserVotes)
  );
  const [votingId, setVotingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [voteError, setVoteError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  async function toggleVote(requestId: string) {
    if (!currentUserId) return;
    if (votingId) return;

    setVotingId(requestId);
    setVoteError(null);
    const hasVoted = userVotes.has(requestId);

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, vote_count: r.vote_count + (hasVoted ? -1 : 1) }
          : r
      )
    );
    setUserVotes((prev) => {
      const next = new Set(prev);
      if (hasVoted) next.delete(requestId);
      else next.add(requestId);
      return next;
    });

    const { error } = hasVoted
      ? await supabase
          .from("votes")
          .delete()
          .eq("request_id", requestId)
          .eq("user_id", currentUserId)
      : await supabase
          .from("votes")
          .insert({ request_id: requestId, user_id: currentUserId });

    if (error) {
      // Revert optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, vote_count: r.vote_count + (hasVoted ? 1 : -1) }
            : r
        )
      );
      setUserVotes((prev) => {
        const next = new Set(prev);
        if (hasVoted) next.add(requestId);
        else next.delete(requestId);
        return next;
      });
      setVoteError("Vote failed — please try again.");
    }

    setVotingId(null);
    router.refresh();
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-light mb-4">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No feature requests yet</h3>
        <p className="text-sm text-muted">
          {currentUserId
            ? "Be the first to submit a feature request!"
            : "Sign in to submit the first feature request."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {voteError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {voteError}
        </p>
      )}
      {requests.map((request) => {
        const hasVoted = userVotes.has(request.id);

        return (
          <div
            key={request.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm flex gap-4"
          >
            {/* Vote button */}
            <div className="flex-shrink-0">
              {currentUserId ? (
                <button
                  onClick={() => toggleVote(request.id)}
                  disabled={votingId === request.id}
                  className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg border transition-all duration-150 ${
                    hasVoted
                      ? "bg-accent text-white border-accent shadow-md shadow-accent/30 scale-105"
                      : "bg-background text-foreground border-border hover:border-accent hover:text-accent hover:scale-105 hover:shadow-sm"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12,4 22,20 2,20" />
                  </svg>
                  <span className="text-base font-bold">
                    {request.vote_count}
                  </span>
                </button>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-12 h-16 rounded-lg border border-border bg-background text-muted cursor-default"
                  title="Sign in to vote"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12,4 22,20 2,20" />
                  </svg>
                  <span className="text-base font-bold">
                    {request.vote_count}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold leading-snug mb-1">
                {request.title}
              </h3>
              {request.description && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(request.id)) next.delete(request.id);
                      else next.add(request.id);
                      return next;
                    })
                  }
                  className="text-left w-full group"
                >
                  <p
                    className={`text-sm text-muted leading-relaxed mb-2 ${
                      expandedIds.has(request.id) ? "" : "line-clamp-2"
                    }`}
                  >
                    {request.description}
                  </p>
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{timeAgo(request.created_at)}</span>
                {request.created_by === currentUserId && currentUserEmail && (
                  <>
                    <span className="text-border">·</span>
                    <span>{currentUserEmail}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
