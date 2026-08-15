"use client";

import { useEffect, useState } from "react";

const types = ["Game / key", "Hardware", "Apparel", "Energy", "Ambassador", "Other"];

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

export function ApplyForm({ turnstileSiteKey }: { turnstileSiteKey?: string | null }) {
  const [status, setStatus] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (document.querySelector("script[data-tigz-turnstile]")) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.dataset.tigzTurnstile = "1";
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  async function onSubmit(formData: FormData) {
    setStatus("Sending…");
    const res = await fetch("/api/partners/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: formData.get("company"),
        contact: formData.get("contact"),
        email: formData.get("email"),
        campaignType: formData.get("campaignType"),
        dates: formData.get("dates"),
        message: formData.get("message"),
        website: formData.get("website"),
        turnstileToken: turnstileToken || undefined,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; mailto?: string; error?: string };
    if (json.ok && json.mailto && json.mailto.startsWith("mailto:")) {
      setStatus("No mail provider configured — opening your email client.");
      window.location.href = json.mailto;
      return;
    }
    setStatus(json.ok ? "Sent to Mythic Talent." : json.error ?? "Could not send.");
    if (window.turnstile) window.turnstile.reset();
    setTurnstileToken("");
  }

  return (
    <form action={onSubmit} className="grid max-w-xl gap-3">
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <Field name="company" label="Company" required />
      <Field name="contact" label="Contact name" required />
      <Field name="email" label="Work email" type="email" required />
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Campaign type</span>
        <select name="campaignType" className="border border-sand-500/20 bg-ink-900 px-3 py-2" defaultValue={types[0]}>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <Field name="dates" label="Desired dates" />
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Brief</span>
        <textarea name="message" rows={6} required className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
      </label>
      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          ref={(node) => {
            if (!node || !turnstileSiteKey || node.dataset.rendered) return;
            const render = () => {
              if (!window.turnstile || node.dataset.rendered) return;
              window.turnstile.render(node, {
                sitekey: turnstileSiteKey,
                callback: (token) => setTurnstileToken(token),
              });
              node.dataset.rendered = "1";
            };
            render();
            const id = window.setInterval(render, 400);
            window.setTimeout(() => window.clearInterval(id), 8000);
          }}
        />
      ) : null}
      <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
        Submit
      </button>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-mono text-[10px] stencil text-sand-500">{label}</span>
      <input name={name} type={type} required={required} className="border border-sand-500/20 bg-ink-900 px-3 py-2" />
    </label>
  );
}
