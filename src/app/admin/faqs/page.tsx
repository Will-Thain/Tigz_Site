import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { FAQ_CATEGORIES, loadFaqs } from "@/data/faqs";
import { FaqAdmin } from "./FaqAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin FAQs" };

export default async function AdminFaqsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const faqs = await loadFaqs();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">FAQs</h1>
        <p className="mt-2 text-sand-300">
          <Link href="/admin" className="text-olive-400">
            Publish queue
          </Link>{" "}
          · stored for the hub to read on /faq
        </p>
      </header>
      <FaqAdmin faqs={faqs} categories={FAQ_CATEGORIES} />
    </div>
  );
}
