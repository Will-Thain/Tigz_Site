import { faqs as seedFaqs } from "@/data/faqs";
import { FaqSearch } from "@/components/FaqSearch";
import { readStore } from "@/lib/store";
import type { Faq } from "@/data/faqs";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await readStore<Faq[]>("faqs", seedFaqs);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Answers</p>
        <h1 className="font-display text-4xl">FAQ</h1>
      </header>
      <FaqSearch faqs={faqs} />
    </div>
  );
}
