"use client";

import { useEffect, useState } from "react";
import { pollIsOpen, type Poll } from "@/data/polls";

export function PollList({ polls }: { polls: Poll[] }) {
  const [local, setLocal] = useState<Poll[]>(polls);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setLocal(polls);
  }, [polls]);

  async function vote(pollId: string, optionId: string) {
    if (voted[pollId]) return;
    setNotice(null);
    const res = await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId, optionId }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string; polls?: Poll[] };
    if (json.polls) setLocal(json.polls);
    if (json.ok || json.error === "Already voted.") {
      setVoted((prev) => ({ ...prev, [pollId]: true }));
    }
    if (!json.ok && json.error) setNotice(json.error);
  }

  return (
    <div className="space-y-6">
      {local.map((poll) => {
        const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        const open = pollIsOpen(poll) && !voted[poll.id];
        return (
          <article key={poll.id} className="frame p-5">
            <h2 className="font-display text-2xl">{poll.question}</h2>
            <p className="mt-1 font-mono text-[11px] text-sand-500">
              {pollIsOpen(poll) ? `Closes ${new Date(poll.closesAt).toUTCString()}` : "Closed"}
            </p>
            <ul className="mt-4 space-y-2">
              {poll.options.map((opt) => {
                const pct = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      disabled={!open}
                      onClick={() => vote(poll.id, opt.id)}
                      className="flex w-full items-center justify-between border border-sand-500/15 bg-ink-900 px-3 py-2 text-left text-sm hover:border-olive-500/40 disabled:cursor-default disabled:hover:border-sand-500/15"
                    >
                      <span>{opt.label}</span>
                      <span className="font-mono text-sand-500">
                        {pct}% · {opt.votes}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
      {local.length === 0 ? (
        <p className="text-sm text-sand-500">No polls yet. Check back after the next stream question.</p>
      ) : null}
      {notice ? <p className="text-sm text-sand-300">{notice}</p> : null}
      <p className="text-sm text-sand-500">
        One vote per poll in this browser. Twitch login for verified ballots comes later.
      </p>
    </div>
  );
}
