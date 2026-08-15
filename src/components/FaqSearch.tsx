"use client";

import { useMemo, useState } from "react";
import type { Faq } from "@/data/faqs";

export function FaqSearch({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  return (
    <div className="space-y-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search FAQs — kit, Discord, schedule…"
        className="w-full border border-sand-500/20 bg-ink-900 px-4 py-3 text-sand-100 outline-none placeholder:text-sand-500 focus:border-olive-500"
      />
      <div className="space-y-3">
        {filtered.map((faq) => (
          <article key={faq.id} className="frame p-4">
            <p className="font-mono text-[10px] stencil text-sand-500">{faq.category}</p>
            <h2 className="mt-1 font-display text-2xl">{faq.question}</h2>
            <p className="mt-2 text-sand-300">{faq.answer}</p>
          </article>
        ))}
        {filtered.length === 0 ? <p className="text-sand-500">No matches. Try Discord.</p> : null}
      </div>
    </div>
  );
}
