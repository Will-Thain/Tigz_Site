"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pollIsOpen, type Poll } from "@/data/polls";

export function PollAdmin({ polls }: { polls: Poll[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onCreate(formData: FormData) {
    setStatus("Saving…");
    const options = String(formData.get("options") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: formData.get("question"),
        closesAt: formData.get("closesAt"),
        options,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Poll published." : (json.error ?? "Could not create poll."));
    if (json.ok) router.refresh();
  }

  async function closePoll(id: string) {
    setStatus("Closing…");
    const res = await fetch("/api/admin/polls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: false }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Poll closed." : (json.error ?? "Could not close poll."));
    if (json.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form action={onCreate} className="frame grid max-w-xl gap-3 p-5">
        <h2 className="font-display text-2xl">New poll</h2>
        <label className="grid gap-1 text-sm">
          <span className="font-mono text-[10px] stencil text-sand-500">Question</span>
          <input name="question" required className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-mono text-[10px] stencil text-sand-500">Closes</span>
          <input name="closesAt" type="datetime-local" className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-mono text-[10px] stencil text-sand-500">Options (one per line)</span>
          <textarea name="options" rows={4} required className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
        </label>
        <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
          Create poll
        </button>
      </form>

      <ul className="space-y-3">
        {polls.map((poll) => {
          const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const open = pollIsOpen(poll);
          return (
            <li key={poll.id} className="frame p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{poll.question}</h2>
                  <p className="mt-1 font-mono text-[11px] text-sand-500">
                    {open ? `Closes ${new Date(poll.closesAt).toUTCString()}` : "Closed"} · {total} votes
                  </p>
                </div>
                {open ? (
                  <button
                    type="button"
                    onClick={() => closePoll(poll.id)}
                    className="border border-sand-500/20 px-3 py-2 font-mono text-[11px] stencil text-sand-100"
                  >
                    Close
                  </button>
                ) : null}
              </div>
              <ul className="mt-3 space-y-1 text-sm text-sand-300">
                {poll.options.map((opt) => (
                  <li key={opt.id}>
                    {opt.label} · {opt.votes}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </div>
  );
}
