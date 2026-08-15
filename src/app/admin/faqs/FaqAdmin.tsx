"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Faq } from "@/data/faqs";

export function FaqAdmin({ faqs, categories }: { faqs: Faq[]; categories: Faq["category"][] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onCreate(formData: FormData) {
    setStatus("Saving…");
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: formData.get("question"),
        answer: formData.get("answer"),
        category: formData.get("category"),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "FAQ added." : (json.error ?? "Could not add FAQ."));
    if (json.ok) router.refresh();
  }

  async function onSave(formData: FormData) {
    setStatus("Saving…");
    const res = await fetch("/api/admin/faqs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: formData.get("id"),
        question: formData.get("question"),
        answer: formData.get("answer"),
        category: formData.get("category"),
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    setStatus(json.ok ? "FAQ updated." : (json.error ?? "Could not update FAQ."));
    if (json.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <form action={onCreate} className="frame grid max-w-xl gap-3 p-5">
        <h2 className="font-display text-2xl">Add FAQ</h2>
        <FaqFields categories={categories} />
        <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
          Add
        </button>
      </form>

      <ul className="space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id}>
            <form action={onSave} className="frame grid max-w-xl gap-3 p-5">
              <input type="hidden" name="id" value={faq.id} />
              <FaqFields faq={faq} categories={categories} />
              <button type="submit" className="bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
      {status ? <p className="text-sm text-sand-300">{status}</p> : null}
    </div>
  );
}

function FaqFields({ faq, categories }: { faq?: Faq; categories: Faq["category"][] }) {
  return (
    <>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Category</span>
        <select
          name="category"
          defaultValue={faq?.category ?? "Community"}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Question</span>
        <input
          name="question"
          required
          defaultValue={faq?.question}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-mono text-[10px] stencil text-sand-500">Answer</span>
        <textarea
          name="answer"
          required
          rows={4}
          defaultValue={faq?.answer}
          className="border border-sand-500/20 bg-ink-900 px-3 py-2"
        />
      </label>
    </>
  );
}
