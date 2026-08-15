import Link from "next/link";
import { nav } from "@/data/nav";
import { LINKS } from "@/lib/links";
import { LivePill } from "./LivePill";
import { WatchCta } from "./WatchCta";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-500/15 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 font-display text-2xl font-semibold tracking-wide text-sand-100">
          TIGZ
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1 font-mono text-[11px] stencil text-sand-300 hover:text-sand-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LivePill />
          <WatchCta href={LINKS.twitch} />
        </div>
      </div>
      <nav className="flex gap-3 overflow-x-auto border-t border-sand-500/10 px-4 py-2 md:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap font-mono text-[11px] stencil text-sand-300">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
