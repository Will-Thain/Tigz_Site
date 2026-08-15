"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Sponsor } from "@/data/sponsors";

export function SponsorAdmin({ sponsors }: { sponsors: Sponsor[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onCreate(formData: FormData) {
    setStatus("Saving…");
    const res = await fetch("/api/admin/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        url: formData.get("url"),
        blurb: formData.get("blurb"),
        status: formData.get("status"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Sponsor added." : (json.error ?? "Could not add sponsor."));
    if (json.ok) router.refresh();
  }

  async function onSave(formData: FormData) {
    setStatus("Saving…");
    const res = await fetch("/api/admin/sponsors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: formData.get("id"),
        name: formData.get("name"),
        url: formData.get("url"),
        blurb: formData.get("blurb"),
        status: formData.get("status"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Sponsor updated." : (json.error ?? "Could not update sponsor."));
    if (json.ok) router.refresh();
  }

  async function onDelete(id: string) {
    setStatus("Removing…");
    const res = await fetch(`/api/admin/sponsors?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Sponsor removed." : (json.error ?? "Could not remove sponsor."));
    if (json.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form action={onCreate} className="frame grid max-w-xl gap-3 p-5">
        <h2 className="font-display text-2xl">Add partner</h2>
        <SponsorFields />
        <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
          Add
        </button>
      </form>

      <ul className="space-y-3">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id}>
            <form action={onSave} className="frame grid max-w-xl gap-3 p-5">
              <input type="hidden" name="id" value={sponsor.id} />
              <SponsorFields sponsor={sponsor} />
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(sponsor.id)}
                  className="border border-sand-500/20 px-3 py-2 font-mono text-[11px] stencil text-sand-100"
                >
                  Delete
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </div>
  );
}

function SponsorFields({ sponsor }: { sponsor?: Sponsor }) {
  return (
    <>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Name</span>
        <input
          name="name"
          required
          defaultValue={sponsor?.name}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">URL</span>
        <input
          name="url"
          type="url"
          required
          defaultValue={sponsor?.url}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Blurb</span>
        <input name="blurb" defaultValue={sponsor?.blurb} className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Status</span>
        <select
          name="status"
          defaultValue={sponsor?.status ?? "current"}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        >
          <option value="current">current</option>
          <option value="past">past</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Sort order</span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={sponsor?.sortOrder ?? 0}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
    </>
  );
}
