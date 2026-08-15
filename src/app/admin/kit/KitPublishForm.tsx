"use client";

import { useState } from "react";
import { KIT_SLOTS } from "@/data/kits";

export function KitPublishForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("Publishing…");
    const items = KIT_SLOTS.map((slot) => ({
      slot,
      label: String(formData.get(`${slot}-label`) ?? ""),
      itemId: String(formData.get(`${slot}-itemId`) ?? ""),
      detail: String(formData.get(`${slot}-detail`) ?? ""),
    }));

    const res = await fetch("/api/admin/kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wipe: formData.get("wipe"),
        title: formData.get("title"),
        notes: formData.get("notes"),
        vodUrl: formData.get("vodUrl"),
        items,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "Published. /kit now shows this loadout." : json.error ?? "Could not publish.");
  }

  return (
    <form action={onSubmit} className="grid gap-6">
      <div className="grid max-w-xl gap-3">
        <Field name="wipe" label="Wipe" required defaultValue="1.0" />
        <Field name="title" label="Title" required />
        <label className="grid gap-1 text-sm">
          <span className="font-mono text-[10px] stencil text-sand-500">Notes</span>
          <textarea name="notes" rows={4} className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
        </label>
        <Field name="vodUrl" label="VOD URL" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {KIT_SLOTS.map((slot) => (
          <fieldset key={slot} className="frame grid gap-2 p-4">
            <legend className="font-mono text-[10px] stencil text-olive-400">{slot}</legend>
            <Field name={`${slot}-label`} label="Label" />
            <Field name={`${slot}-itemId`} label="Item ID (optional)" />
            <Field name={`${slot}-detail`} label="Detail" />
          </fieldset>
        ))}
      </div>

      <button type="submit" className="w-fit bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
        Publish kit
      </button>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-mono text-[10px] stencil text-sand-500">{label}</span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="border border-sand-500/20 bg-ink-900 px-3 py-2"
      />
    </label>
  );
}
