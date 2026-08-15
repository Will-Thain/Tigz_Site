export function WatchCta({ href, label = "Watch on Twitch" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="bg-twitch px-3 py-1.5 font-mono text-[11px] stencil text-white hover:brightness-110"
    >
      {label}
    </a>
  );
}
