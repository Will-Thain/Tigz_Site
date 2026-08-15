import { LINKS } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-500/15 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-sand-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-[11px] stencil">Tigz hub · not affiliated with Battlestate Games</p>
        <div className="flex flex-wrap gap-4">
          <a href={LINKS.twitch} className="hover:text-sand-100">
            Twitch
          </a>
          <a href={LINKS.youtube} className="hover:text-sand-100">
            YouTube
          </a>
          <a href={LINKS.discord} className="hover:text-sand-100">
            Discord
          </a>
          <a href={LINKS.tips} className="hover:text-sand-100">
            Tip
          </a>
          <a href={`mailto:${LINKS.talentEmail}`} className="hover:text-sand-100">
            Business
          </a>
        </div>
      </div>
    </footer>
  );
}
