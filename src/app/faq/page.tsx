import { loadFaqs } from "@/data/faqs";
import { FaqSearch } from "@/components/FaqSearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await loadFaqs();

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
