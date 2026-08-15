"use client";

import { useState } from "react";
import type { CharacterProgress } from "@/data/progress";

export function ProgressEditForm({ stats }: { stats: CharacterProgress }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("Saving…");
    const res = await fetch("/api/admin/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pmcLevel: formData.get("pmcLevel"),
        pmcKd: formData.get("pmcKd"),
        scavKd: formData.get("scavKd"),
        survival: formData.get("survival"),
        hideoutNotes: formData.get("hideoutNotes"),
        questNotes: formData.get("questNotes"),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Saved. /progress shows these stats." : json.error ?? "Could not save.");
  }

  return (
    <form action={onSubmit} className="grid max-w-xl gap-3">
      <Field name="pmcLevel" label="PMC level" defaultValue={stats.pmcLevel} />
      <Field name="pmcKd" label="PMC K/D" defaultValue={stats.pmcKd} />
      <Field name="scavKd" label="Scav K/D" defaultValue={stats.scavKd} />
      <Field name="survival" label="Survival" defaultValue={stats.survival} />
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Hideout notes</span>
        <textarea
          name="hideoutNotes"
          rows={4}
          defaultValue={stats.hideoutNotes}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Quest notes</span>
        <textarea
          name="questNotes"
          rows={4}
          defaultValue={stats.questNotes}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
      <button type="submit" className="w-fit bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
        Save progress
      </button>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-mono text-[10px] stencil text-sand-500">{label}</span>
      <input name={name} defaultValue={defaultValue} className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
    </label>
  );
}
