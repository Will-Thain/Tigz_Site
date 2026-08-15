"use client";

import { useState } from "react";

export function EventSubSetup({ callback }: { callback: string | null }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit() {
    setStatus("Subscribing…");
    const res = await fetch("/api/admin/eventsub", { method: "POST" });
    const json = (await res.json()) as { ok?: boolean; error?: string; callback?: string | null };
    setStatus(json.ok ? `Subscribed. Callback ${json.callback ?? callback ?? "set"}.` : json.error ?? "Setup failed.");
  }

  return (
    <section className="frame p-5">
      <h2 className="font-display text-2xl">Live EventSub</h2>
      <p className="mt-2 text-sm text-sand-300">
        Registers <span className="font-mono text-sand-100">stream.online</span> and{" "}
        <span className="font-mono text-sand-100">stream.offline</span> webhooks. Helix stays the source for title and
        viewers.
      </p>
      <p className="mt-2 font-mono text-[11px] text-sand-500">
        Callback: {callback ?? "set NEXT_PUBLIC_SITE_URL first"}
      </p>
      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950"
      >
        Subscribe webhooks
      </button>
      {status ? <p className="mt-3 text-sm text-sand-300">{status}</p> : null}
    </section>
  );
}
